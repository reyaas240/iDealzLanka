import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const settings = await prisma.oAuthSettings.findMany({
      orderBy: { provider: 'asc' }
    })

    // Only return enabled providers with credentials AND environment variables
    const enabledSettings = settings.filter(s => {
      if (!s.isEnabled || !s.clientId) return false
      
      // Check if corresponding environment variables are set
      switch (s.provider) {
        case 'GOOGLE':
          return !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET
        case 'FACEBOOK':
          return !!process.env.FACEBOOK_CLIENT_ID && !!process.env.FACEBOOK_CLIENT_SECRET
        case 'APPLE':
          return !!process.env.APPLE_CLIENT_ID && !!process.env.APPLE_CLIENT_SECRET
        default:
          return false
      }
    })

    return NextResponse.json({ settings: enabledSettings })
  } catch (error) {
    console.error("OAuth settings fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch OAuth settings" },
      { status: 500 }
    )
  }
}
