import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { sendWinnerNotificationEmail } from "@/lib/email"

export async function POST(
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
    const { couponId, prize } = body

    if (!couponId || !prize) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get product
    const product = await prisma.product.findUnique({
      where: { id: params.id }
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Get coupon with order
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      include: {
        order: {
          include: {
            user: true
          }
        }
      }
    })

    if (!coupon) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 }
      )
    }

    // Check if coupon already has a winner
    if (coupon.productId !== params.id) {
      return NextResponse.json(
        { error: "Coupon does not belong to this product" },
        { status: 400 }
      )
    }

    // Create winner record
    const winner = await prisma.winner.create({
      data: {
        productId: params.id,
        orderId: coupon.orderId,
        couponId: coupon.id,
        prize
      },
      include: {
        order: {
          include: {
            user: true
          }
        },
        coupon: true
      }
    })

    // Send winner notification email
    if (winner.order.user.email) {
      await sendWinnerNotificationEmail(
        winner.order.user.email,
        {
          winner,
          product,
          coupon: winner.coupon
        }
      )
    }

    return NextResponse.json({ success: true, winner })
  } catch (error) {
    console.error("Winner selection error:", error)
    return NextResponse.json(
      { error: "Failed to select winner" },
      { status: 500 }
    )
  }
}
