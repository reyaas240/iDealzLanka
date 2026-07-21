import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { generateCouponsForOrder } from "@/lib/qrcode"
import { sendOrderConfirmationEmail } from "@/lib/email"
import { writeFile } from "fs/promises"
import { join } from "path"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const mobile = formData.get("mobile") as string
    const country = formData.get("country") as string
    const transactionId = formData.get("transactionId") as string
    const receipt = formData.get("receipt") as File

    if (!name || !email || !mobile || !transactionId || !receipt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get cart items
    const sessionId = request.cookies.get("cartSessionId")?.value
    if (!sessionId) {
      return NextResponse.json(
        { error: "No cart found" },
        { status: 400 }
      )
    }

    const cart = await prisma.cart.findUnique({
      where: { sessionId }
    })

    if (!cart || !cart.items || (cart.items as any[]).length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      )
    }

    const cartItems = cart.items as any[]

    // Upload receipt
    let receiptUrl: string
    const timestamp = Date.now()
    const filename = `receipt-${timestamp}-${receipt.name}`

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Use Vercel Blob
      const blob = await put(filename, receipt, {
        access: "public",
      })
      receiptUrl = blob.url
    } else {
      // Use local storage
      const bytes = await receipt.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const uploadDir = join(process.cwd(), "public", "uploads", "receipts")
      const filepath = join(uploadDir, filename)
      
      // Create directory if it doesn't exist
      await writeFile(filepath, buffer)
      receiptUrl = `/uploads/receipts/${filename}`
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          mobile,
          country,
          role: "CUSTOMER"
        }
      })
    } else {
      // Update user info if needed
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name,
          mobile,
          country
        }
      })
    }

    // Create orders for each cart item (one product type per order)
    const orderIds = []
    for (const item of cartItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      })

      if (!product) {
        continue
      }

      const total = Number(product.price) * item.quantity

      // Check availability
      const availableItems = product.totalItems - product.soldItems
      if (availableItems < item.quantity) {
        continue
      }

      // Create order
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          productId: item.productId,
          quantity: item.quantity,
          total,
          currency: product.currency,
          paymentMethod: "BANK_TRANSFER",
          paymentDetails: { transactionId },
          status: "PENDING_APPROVAL"
        },
        include: {
          user: true,
          product: true
        }
      })

      // Create bank transfer record
      await prisma.bankTransfer.create({
        data: {
          orderId: order.id,
          receiptUrl,
          transactionId,
          status: "PENDING"
        }
      })

      // Update product sold items
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          soldItems: {
            increment: item.quantity
          }
        }
      })

      orderIds.push(order.id)

      // Send order confirmation email without coupons
      if (user.email) {
        await sendOrderConfirmationEmail(
          user.email,
          {
            order,
            product,
            coupons: []
          },
          false
        )
      }
    }

    // Clear cart
    await prisma.cart.update({
      where: { id: cart.id },
      data: { items: [] }
    })

    if (orderIds.length === 0) {
      return NextResponse.json(
        { error: "No orders could be created" },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      orderId: orderIds[0], // Return first order ID for redirect
      totalOrders: orderIds.length 
    })
  } catch (error) {
    console.error("Create order error:", error)
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    )
  }
}
