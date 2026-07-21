'use client'

import { useState } from 'react'
import Link from 'next/link'

interface ProductDetailClientProps {
  product: any
  availableItems: number
  isSoldOut: boolean
}

export default function ProductDetailClient({ product, availableItems, isSoldOut }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  const handleAddToCart = async () => {
    setAddingToCart(true)
    
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity
        })
      })

      if (response.ok) {
        setAddedToCart(true)
        setTimeout(() => setAddedToCart(false), 3000)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to add to cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add to cart')
    } finally {
      setAddingToCart(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">iDealzSrilanka</Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/products" className="text-gray-700 hover:text-blue-600 transition">Products</Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 transition">About</Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition">Contact</Link>
          </nav>
          <div className="flex gap-4">
            <Link href="/auth/signin" className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">Sign In</Link>
            <Link href="/auth/signup" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Sign Up</Link>
          </div>
        </div>
      </header>

      {/* Product Detail */}
      <section className="container mx-auto px-4 py-12">
        <Link href="/products" className="inline-block mb-6 text-blue-600 hover:text-blue-700 transition">
          ← Back to Products
        </Link>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 h-96 flex items-center justify-center">
                  <span className="text-blue-400">Product Image</span>
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1).map((image: string, index: number) => (
                  <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
                    <img
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      className="w-full h-24 object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <p className="text-3xl font-bold text-blue-600 mb-6">
              {product.currency} {Number(product.price).toLocaleString()}
            </p>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Draw Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(product.drawDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Available Items</p>
                  <p className={`font-semibold ${isSoldOut ? 'text-red-600' : 'text-gray-900'}`}>
                    {availableItems} / {product.totalItems}
                  </p>
                </div>
              </div>
              {isSoldOut && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-800 font-medium">Sold Out</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">How It Works</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>Purchase this product to support charitable causes</li>
                <li>Receive a unique QR coupon for each item purchased</li>
                <li>Wait for the draw date to be announced</li>
                <li>Winners will be selected and notified via email</li>
                <li>Check your QR coupons in the user portal</li>
              </ol>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quantity</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100 transition"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 border-x font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(availableItems, quantity + 1))}
                    className="px-4 py-2 hover:bg-gray-100 transition"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  Total: {product.currency} {(Number(product.price) * quantity).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              {isSoldOut ? (
                <button
                  disabled
                  className="flex-1 px-8 py-4 bg-gray-400 text-white rounded-lg cursor-not-allowed font-semibold"
                >
                  Sold Out
                </button>
              ) : addedToCart ? (
                <button
                  disabled
                  className="flex-1 px-8 py-4 bg-green-600 text-white rounded-lg font-semibold"
                >
                  ✓ Added to Cart
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
              )}
              <Link
                href="/cart"
                className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold"
              >
                View Cart
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">iDealzSrilanka</h3>
              <p className="text-gray-400">Support charity, win prizes, make a difference.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/products" className="hover:text-white transition">Products</Link></li>
                <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/terms" className="hover:text-white transition">Terms & Conditions</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: info@idealsrilanka.com</li>
                <li>Phone: +94 11 123 4567</li>
                <li>Colombo, Sri Lanka</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 iDealzSrilanka. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
