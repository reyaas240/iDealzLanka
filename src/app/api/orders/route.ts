import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { generateCouponsForOrder } from "@/lib/qrcode"
import { sendOrderConfirmationEmail } from "@/lib/email"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { put } from "@vercel/blob"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { userId: (session.user as any).id },
      include: {
        product: true,
        coupons: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Get orders error:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Starting order creation...')
    const session = await getServerSession(authOptions)
    
    // Check if logged-in user has mobile number
    if (session && session.user) {
      const user = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        select: { mobile: true }
      })
      
      if (!user?.mobile) {
        return NextResponse.json(
          { error: "Please add your mobile number in your profile before placing an order", requiresMobile: true },
          { status: 400 }
        )
      }
    }
    
    const formData = await request.formData()
    console.log('FormData received')
    
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const mobile = formData.get("mobile") as string
    const country = formData.get("country") as string
    const transactionId = formData.get("transactionId") as string
    const receipt = formData.get("receipt") as File
    const skipPayment = formData.get("skipPayment") === "true"

    console.log('Form data extracted:', { name, email, mobile, transactionId, skipPayment })

    if (!name || !email || !mobile) {
      console.log('Missing required fields')
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!skipPayment && (!transactionId || !receipt)) {
      console.log('Missing payment details')
      return NextResponse.json(
        { error: "Transaction ID and receipt are required when not skipping payment" },
        { status: 400 }
      )
    }

    // Get cart items
    const sessionId = request.cookies.get("cartSessionId")?.value
    console.log('Cart session ID:', sessionId)
    
    if (!sessionId) {
      console.log('No cart session found')
      return NextResponse.json(
        { error: "No cart found" },
        { status: 400 }
      )
    }

    const cart = await prisma.cart.findUnique({
      where: { sessionId }
    })

    console.log('Cart found:', cart)

    if (!cart || !cart.items || (cart.items as any[]).length === 0) {
      console.log('Cart is empty')
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      )
    }

    const cartItems = cart.items as any[]
    console.log('Cart items:', cartItems)

    // Upload receipt only if not skipping payment
    let receiptUrl: string | null = null
    if (!skipPayment && receipt) {
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
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true })
        }
        
        await writeFile(filepath, buffer)
        receiptUrl = `/uploads/receipts/${filename}`
      }
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
          paymentDetails: skipPayment ? {} : { transactionId },
          status: skipPayment ? "PENDING_PAYMENT" : "PENDING_APPROVAL"
        },
        include: {
          user: true,
          product: true
        }
      })

      // Create bank transfer record only if not skipping payment
      if (!skipPayment && receiptUrl && transactionId) {
        await prisma.bankTransfer.create({
          data: {
            orderId: order.id,
            receiptUrl,
            transactionId,
            status: "PENDING"
          }
        })
      }

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
    console.error("Error details:", JSON.stringify(error, null, 2))
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create order" },
      { status: 500 }
    )
  }
}
