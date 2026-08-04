'use client'

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Header from "@/components/Header"

async function getUserWinnings() {
  const response = await fetch('/api/winnings')
  if (!response.ok) return []
  const data = await response.json()
  return data.winnings || []
}

export default function WinningsPage() {
  const { data: session, status } = useSession()
  const [winnings, setWinnings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect("/auth/signin")
    }

    if (status === 'authenticated') {
      loadWinnings()
    }
  }, [status])

  const loadWinnings = async () => {
    const winningsData = await getUserWinnings()
    setWinnings(winningsData)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header showNav={false} />

      {/* User Navigation */}
      <nav className="bg-white dark:bg-gray-900 border-b dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex gap-6 py-4">
            <a href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">My Orders</a>
            <a href="/dashboard/winnings" className="text-blue-600 dark:text-blue-400 font-medium">My Winnings</a>
            <a href="/dashboard/coupons" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">My Coupons</a>
            <a href="/dashboard/profile" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Profile</a>
          </div>
        </div>
      </nav>

      {/* Winnings Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Winnings</h1>
        </div>

        {winnings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No winnings yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Your winnings will appear here after draws are conducted</p>
            <a href="/products" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Browse Products
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {winnings.map((winner: any) => (
              <div key={winner.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-green-200 dark:border-green-800">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{winner.product.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Won on: {new Date(winner.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                    🎉 Winner
                  </span>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700 dark:text-green-300 font-medium mb-1">Your Prize</p>
                      <p className="text-xl font-bold text-green-900 dark:text-green-100">{winner.prize}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-700 dark:text-green-300 font-medium mb-1">Winning Coupon</p>
                      <p className="font-mono font-semibold text-green-900 dark:text-green-100">{winner.coupon.couponCode}</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Order ID</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{winner.orderId.slice(0, 8)}...</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Product Draw Date</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {new Date(winner.product.drawDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
