import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import * as bcrypt from "bcryptjs"
import { generateOTP, sendOTPByEmail } from "@/lib/otp"

export async function POST(request: NextRequest) {
  try {
    const { name, email, mobile, password, country } = await request.json()

    if (!name || !email || !mobile || !password) {
      return NextResponse.json(
        { error: "Name, email, mobile, and password are required" },
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

    // Generate and send OTP for email verification
    const otp = await generateOTP(user.id, "EMAIL")

    // Send OTP email (will fail if RESEND_API_KEY not configured)
    try {
      await sendOTPByEmail(email, otp)
    } catch (error) {
      console.error("Failed to send OTP email:", error)
      // Continue anyway - OTP is stored in database
    }

    return NextResponse.json({ 
      success: true, 
      message: "Account created. Please verify your email with the OTP sent.",
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
