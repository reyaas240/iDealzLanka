import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const settings = await prisma.siteSettings.findFirst()
    
    if (!settings) {
      return NextResponse.json({ 
        bankName: null,
        bankAccountNumber: null,
        bankAccountName: null,
        bankBranch: null
      })
    }

    return NextResponse.json({
      bankName: settings.bankName,
      bankAccountNumber: settings.bankAccountNumber,
      bankAccountName: settings.bankAccountName,
      bankBranch: settings.bankBranch
    })
  } catch (error) {
    console.error("Settings fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}
