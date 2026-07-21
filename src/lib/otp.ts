import { prisma } from "./db"
import { Resend } from "resend"
import twilio from "twilio"

// Initialize services only if API keys are available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null

export async function generateOTP(userId: string, type: "EMAIL" | "MOBILE"): Promise<string> {
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  await prisma.otp.create({
    data: {
      userId,
      code,
      type,
      expiresAt,
    },
  })

  return code
}

export async function sendOTPByEmail(email: string, code: string): Promise<void> {
  if (!resend) {
    console.log("Resend API key not configured. OTP code:", code)
    return // Don't throw error, just log the code for development
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@idealsrilanka.com",
      to: email,
      subject: "Your Verification Code",
      html: `
        <h1>Your Verification Code</h1>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      `,
    })
  } catch (error) {
    console.error("Failed to send email OTP:", error)
    throw new Error("Failed to send OTP via email")
  }
}

export async function sendOTPBySMS(mobile: string, code: string): Promise<void> {
  if (!twilioClient) {
    console.log("Twilio API keys not configured. OTP code:", code)
    return // Don't throw error, just log the code for development
  }

  try {
    await twilioClient.messages.create({
      body: `Your verification code is: ${code}. This code will expire in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: mobile,
    })
  } catch (error) {
    console.error("Failed to send SMS OTP:", error)
    throw new Error("Failed to send OTP via SMS")
  }
}

export async function verifyOTP(userId: string, code: string): Promise<boolean> {
  const otp = await prisma.otp.findFirst({
    where: {
      userId,
      code,
      used: false,
      expiresAt: {
        gt: new Date(),
      },
    },
  })

  if (!otp) {
    return false
  }

  await prisma.otp.update({
    where: { id: otp.id },
    data: { used: true },
  })

  return true
}

export async function sendOTP(identifier: string, type: "EMAIL" | "MOBILE"): Promise<void> {
  const user = await prisma.user.findFirst({
    where: type === "EMAIL" 
      ? { email: identifier }
      : { mobile: identifier },
  })

  if (!user) {
    throw new Error("User not found")
  }

  const code = await generateOTP(user.id, type)

  if (type === "EMAIL") {
    await sendOTPByEmail(identifier, code)
  } else {
    await sendOTPBySMS(identifier, code)
  }
}
