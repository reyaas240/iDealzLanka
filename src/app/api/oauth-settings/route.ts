import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const settings = await prisma.oAuthSettings.findMany({
      orderBy: { provider: 'asc' }
    })

    // Only return enabled providers with credentials
    const enabledSettings = settings.filter(s => s.isEnabled && s.clientId)

    return NextResponse.json({ settings: enabledSettings })
  } catch (error) {
    console.error("OAuth settings fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch OAuth settings" },
      { status: 500 }
    )
  }
}
