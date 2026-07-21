import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET cart - for authenticated users, return their cart items
// For guest users, return cart based on sessionId
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const sessionId = request.cookies.get('cartSessionId')?.value

    if (session?.user) {
      // For authenticated users, we could implement a user-specific cart
      // For now, we'll use session-based cart for simplicity
      if (!sessionId) {
        return NextResponse.json({ items: [] })
      }
    }

    if (!sessionId) {
      return NextResponse.json({ items: [] })
    }

    const cart = await prisma.cart.findUnique({
      where: { sessionId }
    })

    if (!cart) {
      return NextResponse.json({ items: [] })
    }

    return NextResponse.json({ items: cart.items })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

// POST cart - add item to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, quantity } = body

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json({ error: 'Invalid product or quantity' }, { status: 400 })
    }

    // Verify product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product || !product.isActive) {
      return NextResponse.json({ error: 'Product not available' }, { status: 404 })
    }

    const availableItems = product.totalItems - product.soldItems
    if (availableItems < quantity) {
      return NextResponse.json({ error: 'Not enough items available' }, { status: 400 })
    }

    // Get or create session ID
    let sessionId = request.cookies.get('cartSessionId')?.value
    if (!sessionId) {
      sessionId = crypto.randomUUID()
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { sessionId }
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          sessionId,
          items: []
        }
      })
    }

    // Update cart items
    const items = cart.items as any[]
    const existingItemIndex = items.findIndex(item => item.productId === productId)

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const newQuantity = items[existingItemIndex].quantity + quantity
      if (availableItems < newQuantity) {
        return NextResponse.json({ error: 'Not enough items available' }, { status: 400 })
      }
      items[existingItemIndex].quantity = newQuantity
    } else {
      // Add new item
      items.push({
        productId,
        quantity,
        name: product.name,
        price: Number(product.price),
        currency: product.currency,
        image: product.images?.[0] || null
      })
    }

    cart = await prisma.cart.update({
      where: { id: cart.id },
      data: { items }
    })

    const response = NextResponse.json({ items: cart.items })
    response.cookies.set('cartSessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })

    return response
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
  }
}

// PUT cart - update cart items
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { items } = body

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items format' }, { status: 400 })
    }

    const sessionId = request.cookies.get('cartSessionId')?.value
    if (!sessionId) {
      return NextResponse.json({ error: 'No cart session' }, { status: 400 })
    }

    const cart = await prisma.cart.findUnique({
      where: { sessionId }
    })

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 })
    }

    // Validate items and update quantities
    const updatedItems = []
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      })

      if (!product || !product.isActive) {
        continue // Skip invalid products
      }

      const availableItems = product.totalItems - product.soldItems
      if (availableItems < item.quantity) {
        continue // Skip items with insufficient quantity
      }

      updatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        name: product.name,
        price: Number(product.price),
        currency: product.currency,
        image: product.images?.[0] || null
      })
    }

    const updatedCart = await prisma.cart.update({
      where: { id: cart.id },
      data: { items: updatedItems }
    })

    return NextResponse.json({ items: updatedCart.items })
  } catch (error) {
    console.error('Error updating cart:', error)
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 })
  }
}

// DELETE cart - clear cart or remove specific item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    const sessionId = request.cookies.get('cartSessionId')?.value
    if (!sessionId) {
      return NextResponse.json({ error: 'No cart session' }, { status: 400 })
    }

    const cart = await prisma.cart.findUnique({
      where: { sessionId }
    })

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 })
    }

    if (productId) {
      // Remove specific item
      const items = (cart.items as any[]).filter(item => item.productId !== productId)
      const updatedCart = await prisma.cart.update({
        where: { id: cart.id },
        data: { items }
      })
      return NextResponse.json({ items: updatedCart.items })
    } else {
      // Clear entire cart
      const updatedCart = await prisma.cart.update({
        where: { id: cart.id },
        data: { items: [] }
      })
      return NextResponse.json({ items: updatedCart.items })
    }
  } catch (error) {
    console.error('Error deleting from cart:', error)
    return NextResponse.json({ error: 'Failed to delete from cart' }, { status: 500 })
  }
}
