import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('GET product with ID:', id)
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== "ADMIN") {
      console.log('Unauthorized access attempt')
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id }
    })

    console.log('Found product:', product)

    if (!product) {
      console.log('Product not found')
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Product fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, price, currency, totalItems, itemPrefix, drawDate, images, isActive } = body

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        currency: currency || "LKR",
        totalItems,
        itemPrefix: itemPrefix || name.substring(0, 3).toUpperCase(),
        drawDate: new Date(drawDate),
        images: images || [],
        isActive: isActive !== false
      }
    })

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error("Product update error:", error)
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Product delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    )
  }
}
