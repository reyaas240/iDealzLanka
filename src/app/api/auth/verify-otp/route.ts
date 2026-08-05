import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email, code, tempUserId } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and OTP code are required" },
        { status: 400 }
      )
    }

    // For signup verification (using temp user ID)
    if (tempUserId) {
      const otp = await prisma.otp.findFirst({
        where: {
          userId: tempUserId,
          code,
          used: false,
          expiresAt: {
            gt: new Date(),
          },
        },
      })

      if (!otp) {
        return NextResponse.json(
          { error: "Invalid or expired OTP" },
          { status: 400 }
        )
      }

      // Mark OTP as used
      await prisma.otp.update({
        where: { id: otp.id },
        data: { used: true },
      })

      return NextResponse.json({ 
        success: true, 
        message: "OTP verified successfully" 
      })
    }

    // For existing user verification
    const user = await prisma.user.findFirst({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const otp = await prisma.otp.findFirst({
      where: {
        userId: user.id,
        code,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    })

    if (!otp) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      )
    }

    // Mark OTP as used
    await prisma.otp.update({
      where: { id: otp.id },
      data: { used: true },
    })

    return NextResponse.json({ 
      success: true, 
      message: "OTP verified successfully" 
    })
  } catch (error) {
    console.error("Verify OTP error:", error)
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    )
  }
}
