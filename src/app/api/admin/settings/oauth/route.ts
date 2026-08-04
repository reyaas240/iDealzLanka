import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const settings = await prisma.oAuthSettings.findMany({
      orderBy: { provider: 'asc' }
    })

    // Ensure all providers exist in database
    const providers = ['GOOGLE', 'FACEBOOK', 'APPLE']
    const existingProviders = settings.map(s => s.provider)
    
    for (const provider of providers) {
      if (!existingProviders.includes(provider)) {
        await prisma.oAuthSettings.create({
          data: {
            provider,
            isEnabled: false
          }
        })
      }
    }

    // Fetch again after ensuring all providers exist
    const allSettings = await prisma.oAuthSettings.findMany({
      orderBy: { provider: 'asc' }
    })

    return NextResponse.json({ settings: allSettings })
  } catch (error) {
    console.error("OAuth settings fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch OAuth settings" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { settings } = body

    if (!Array.isArray(settings)) {
      return NextResponse.json(
        { error: "Invalid settings format" },
        { status: 400 }
      )
    }

    // Update each provider setting
    for (const setting of settings) {
      const { provider, isEnabled, clientId, clientSecret } = setting
      
      await prisma.oAuthSettings.upsert({
        where: { provider },
        update: {
          isEnabled,
          clientId: clientId || null,
          clientSecret: clientSecret || null
        },
        create: {
          provider,
          isEnabled,
          clientId: clientId || null,
          clientSecret: clientSecret || null
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("OAuth settings update error:", error)
    console.error("Error details:", JSON.stringify(error, null, 2))
    return NextResponse.json(
      { error: "Failed to update OAuth settings", details: error?.message || String(error) },
      { status: 500 }
    )
  }
}
