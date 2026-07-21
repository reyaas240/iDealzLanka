import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

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
    const {
      logoUrl,
      heroImageUrl,
      heroTitle,
      heroSubtitle,
      noticeText,
      noticeIsActive,
      contactEmail,
      contactPhone,
      contactAddress,
      aboutUs,
      termsAndConditions,
      privacyPolicy,
      bankName,
      bankAccountNumber,
      bankAccountName,
      bankBranch
    } = body

    // Get or create settings
    let settings = await prisma.siteSettings.findFirst()
    
    if (settings) {
      // Update existing settings
      settings = await prisma.siteSettings.update({
        where: { id: settings.id },
        data: {
          logoUrl,
          heroImageUrl,
          heroTitle,
          heroSubtitle,
          noticeText,
          noticeIsActive,
          contactEmail,
          contactPhone,
          contactAddress,
          aboutUs,
          termsAndConditions,
          privacyPolicy,
          bankName,
          bankAccountNumber,
          bankAccountName,
          bankBranch
        }
      })
    } else {
      // Create new settings
      settings = await prisma.siteSettings.create({
        data: {
          logoUrl,
          heroImageUrl,
          heroTitle,
          heroSubtitle,
          noticeText,
          noticeIsActive,
          contactEmail,
          contactPhone,
          contactAddress,
          aboutUs,
          termsAndConditions,
          privacyPolicy,
          bankName,
          bankAccountNumber,
          bankAccountName,
          bankBranch
        }
      })
    }

    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error("Settings save error:", error)
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const settings = await prisma.siteSettings.findFirst()
    
    if (!settings) {
      return NextResponse.json({ settings: {} })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Settings fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}
