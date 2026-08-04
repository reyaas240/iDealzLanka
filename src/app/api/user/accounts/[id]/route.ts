import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify the account belongs to the user
    const account = await prisma.account.findFirst({
      where: {
        id: params.id,
        userId: (session.user as any).id
      }
    })

    if (!account) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      )
    }

    // Check if user has a password (to prevent unlinking all auth methods)
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id }
    })

    const accountCount = await prisma.account.count({
      where: { userId: (session.user as any).id }
    })

    if (accountCount === 1 && !user?.password) {
      return NextResponse.json(
        { error: "Cannot unlink the only authentication method without a password" },
        { status: 400 }
      )
    }

    await prisma.account.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Account unlink error:", error)
    return NextResponse.json(
      { error: "Failed to unlink account" },
      { status: 500 }
    )
  }
}
