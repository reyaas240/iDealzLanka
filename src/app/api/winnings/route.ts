import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id

    const winnings = await prisma.winner.findMany({
      where: {
        order: {
          userId: userId
        }
      },
      include: {
        product: true,
        order: {
          include: {
            user: true
          }
        },
        coupon: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ winnings })
  } catch (error) {
    console.error("Winnings fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch winnings" },
      { status: 500 }
    )
  }
}
