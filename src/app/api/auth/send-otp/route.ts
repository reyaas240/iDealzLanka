import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sendOTP } from "@/lib/otp"

export async function POST(request: NextRequest) {
  try {
    const { identifier } = await request.json()

    if (!identifier) {
      return NextResponse.json(
        { error: "Identifier is required" },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { mobile: identifier }
        ]
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Determine type and send OTP
    const type = identifier.includes("@") ? "EMAIL" : "MOBILE"
    await sendOTP(identifier, type)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    )
  }
}
