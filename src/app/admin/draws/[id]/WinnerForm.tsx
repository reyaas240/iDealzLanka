'use client'

import { useState } from 'react'

interface WinnerFormProps {
  productId: string
  coupons: any[]
  productStatus: string
}

export default function WinnerForm({ productId, coupons, productStatus }: WinnerFormProps) {
  const [couponId, setCouponId] = useState('')
  const [prize, setPrize] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSubmitting(true)

    if (!couponId || !prize) {
      setError('Please select a coupon and enter prize description')
      setSubmitting(false)
      return
    }

    try {
      const response = await fetch(`/api/admin/draws/${productId}/winners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponId, prize })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to announce winner')
      }

      setSuccess(true)
      setCouponId('')
      setPrize('')
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (productStatus !== 'CLOSED') {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-yellow-800 dark:text-yellow-400 font-medium">
          ⚠️ Product must be in CLOSED status to announce winners
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
          Winner announced successfully! Refreshing...
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Coupon
        </label>
        <select
          value={couponId}
          onChange={(e) => setCouponId(e.target.value)}
          required
          disabled={coupons.length === 0}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Select a coupon...</option>
          {coupons.map((coupon) => (
            <option key={coupon.id} value={coupon.id}>
              {coupon.couponCode} - {coupon.order.user.name}
            </option>
          ))}
        </select>
        {coupons.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">No available coupons</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Prize Description
        </label>
        <input
          type="text"
          value={prize}
          onChange={(e) => setPrize(e.target.value)}
          required
          placeholder="e.g., LKR 100,000 Cash Prize"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || coupons.length === 0}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {submitting ? 'Announcing...' : 'Announce Winner'}
      </button>
    </form>
  )
}
