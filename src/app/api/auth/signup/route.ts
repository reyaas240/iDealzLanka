import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import * as bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { name, email, mobile, password, country, otp, tempUserId } = await request.json()

    if (!name || !email || !mobile || !password) {
      return NextResponse.json(
        { error: "Name, email, mobile, and password are required" },
        { status: 400 }
      )
    }

    if (!otp || !tempUserId) {
      return NextResponse.json(
        { error: "OTP verification is required" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { mobile }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or mobile already exists" },
        { status: 409 }
      )
    }

    // Verify OTP
    const otpRecord = await prisma.otp.findFirst({
      where: {
        userId: tempUserId,
        code: otp,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    })

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        mobile,
        password: hashedPassword,
        country,
        role: "CUSTOMER"
      }
    })

    // Mark OTP as used
    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { used: true },
    })

    return NextResponse.json({ 
      success: true, 
      message: "Account created successfully",
      user: { id: user.id, name: user.name, email: user.email }
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    )
  }
}
