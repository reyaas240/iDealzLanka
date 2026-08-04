import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { put } from "@vercel/blob"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    console.log('Bank transfer submission for order ID:', id)
    const formData = await request.formData()
    const transactionId = formData.get("transactionId") as string
    const receipt = formData.get("receipt") as File

    if (!transactionId || !receipt) {
      return NextResponse.json(
        { error: "Transaction ID and receipt are required" },
        { status: 400 }
      )
    }

    // Verify order belongs to user
    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: true }
    })

    console.log('Found order:', order)

    if (!order) {
      console.log('Order not found with ID:', id)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.userId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (order.status !== 'PENDING_PAYMENT') {
      return NextResponse.json({ error: 'Order is not in pending payment status' }, { status: 400 })
    }

    // Upload receipt
    const timestamp = Date.now()
    const filename = `receipt-${timestamp}-${receipt.name}`
    let receiptUrl: string

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
      
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }
      
      await writeFile(filepath, buffer)
      receiptUrl = `/uploads/receipts/${filename}`
    }

    // Create bank transfer record
    await prisma.bankTransfer.create({
      data: {
        orderId: order.id,
        receiptUrl,
        transactionId,
        status: "PENDING"
      }
    })

    // Update order status
    await prisma.order.update({
      where: { id },
      data: {
        status: "PENDING_APPROVAL",
        paymentDetails: { transactionId }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Submit bank transfer error:", error)
    return NextResponse.json(
      { error: "Failed to submit bank transfer" },
      { status: 500 }
    )
  }
}
