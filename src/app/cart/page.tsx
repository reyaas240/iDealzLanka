'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useSession } from 'next-auth/react'

interface CartItem {
  productId: string
  quantity: number
  name: string
  price: number
  currency: string
  image: string | null
}

export default function CartPage() {
  const { data: session, status } = useSession()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart')
      const data = await response.json()
      setItems(data.items || [])
      
      // Get session ID from cookie
      const match = document.cookie.match(/cartSessionId=([^;]+)/)
      setSessionId(match ? match[1] : null)
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeItem(productId)
      return
    }

    const updatedItems = items.map(item =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    )

    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedItems })
      })

      if (response.ok) {
        const data = await response.json()
        setItems(data.items)
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  }

  const removeItem = async (productId: string) => {
    try {
      const response = await fetch(`/api/cart?productId=${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const data = await response.json()
        setItems(data.items)
      }
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }

  const clearCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE'
      })

      if (response.ok) {
        const data = await response.json()
        setItems(data.items)
      }
    } catch (error) {
      console.error('Error clearing cart:', error)
    }
  }

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading cart...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header showCart={true} />

      {/* Cart Content */}
      <section className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Your cart is empty</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Looks like you haven't added any items yet.</p>
            <Link
              href="/products"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.name}</h3>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                        {item.currency} {item.price.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border dark:border-gray-600 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                          >
                            -
                          </button>
                          <span className="px-4 py-2 border-x dark:border-gray-600">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {item.currency} {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Total Items</span>
                    <span>{totalItems}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>LKR {total.toLocaleString()}</span>
                  </div>
                  <div className="border-t dark:border-gray-700 pt-4">
                    <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                      <span>Total</span>
                      <span>LKR {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full px-6 py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition font-semibold mb-4"
                >
                  Proceed to Checkout
                </Link>

                <button
                  onClick={clearCart}
                  className="block w-full px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Clear Cart
                </button>

                <Link
                  href="/products"
                  className="block w-full px-6 py-3 text-blue-600 dark:text-blue-400 text-center hover:text-blue-700 dark:hover:text-blue-300 transition mt-4"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  )
}
