import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { generateCouponsForOrder } from "@/lib/qrcode"
import { sendOrderConfirmationEmail } from "@/lib/email"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status, adminNotes } = body

    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    const bankTransfer = await prisma.bankTransfer.findUnique({
      where: { id: params.id },
      include: {
        order: {
          include: {
            user: true,
            product: true
          }
        }
      }
    })

    if (!bankTransfer) {
      return NextResponse.json(
        { error: "Bank transfer not found" },
        { status: 404 }
      )
    }

    // Update bank transfer status
    const updatedBankTransfer = await prisma.bankTransfer.update({
      where: { id: params.id },
      data: {
        status,
        adminNotes,
        reviewedAt: new Date(),
        reviewedBy: (session.user as any).id
      }
    })

    if (status === "APPROVED") {
      // Generate coupons for the order
      await generateCouponsForOrder(bankTransfer.orderId)

      // Update order status
      await prisma.order.update({
        where: { id: bankTransfer.orderId },
        data: { status: "APPROVED" }
      })

      // Get updated order with coupons
      const updatedOrder = await prisma.order.findUnique({
        where: { id: bankTransfer.orderId },
        include: {
          user: true,
          product: true,
          coupons: true
        }
      })

      // Send email with coupons
      if (updatedOrder && updatedOrder.user.email) {
        await sendOrderConfirmationEmail(
          updatedOrder.user.email,
          {
            order: updatedOrder,
            product: updatedOrder.product,
            coupons: updatedOrder.coupons
          },
          true
        )
      }
    } else {
      // Rejected - update order status and restore product inventory
      await prisma.order.update({
        where: { id: bankTransfer.orderId },
        data: { status: "CANCELLED" }
      })

      // Restore product sold items
      await prisma.product.update({
        where: { id: bankTransfer.order.productId },
        data: {
          soldItems: {
            decrement: bankTransfer.order.quantity
          }
        }
      })
    }

    return NextResponse.json({ success: true, bankTransfer: updatedBankTransfer })
  } catch (error) {
    console.error("Bank transfer approval error:", error)
    return NextResponse.json(
      { error: "Failed to process bank transfer" },
      { status: 500 }
    )
  }
}
