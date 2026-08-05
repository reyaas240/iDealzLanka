import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { generateOTP, sendOTPByEmail } from "@/lib/otp"

export async function POST(request: NextRequest) {
  try {
    const { email, forSignup = false } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // For signup: check if email already exists
    if (forSignup) {
      const existingUser = await prisma.user.findFirst({
        where: { email }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 409 }
        )
      }

      // Generate OTP with a temporary user ID (will be replaced during signup)
      // Use email as temporary identifier
      const tempUserId = `temp_${email}_${Date.now()}`
      console.log('Generating OTP for tempUserId:', tempUserId)
      const otp = await generateOTP(tempUserId, "EMAIL")
      console.log('OTP generated:', otp)
      
      // Send OTP via email
      try {
        console.log('Attempting to send OTP to email:', email)
        await sendOTPByEmail(email, otp)
        console.log('OTP sent successfully')
      } catch (error) {
        console.error("Failed to send OTP email:", error)
        // Continue anyway - OTP is stored in database
      }

      return NextResponse.json({ 
        success: true, 
        message: "OTP sent to your email",
        tempUserId 
      })
    }

    // For existing users (password reset, etc.)
    const user = await prisma.user.findFirst({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const type = "EMAIL"
    const otp = await generateOTP(user.id, type)
    await sendOTPByEmail(email, otp)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    )
  }
}
