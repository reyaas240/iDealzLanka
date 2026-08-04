'use client'

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Header from "@/components/Header"
import Logo from "@/components/Logo"

async function getUserOrders() {
  const response = await fetch('/api/orders')
  if (!response.ok) return []
  return response.json()
}

async function getUserWinnings() {
  const response = await fetch('/api/winnings')
  if (!response.ok) return []
  return response.json()
}

export default function UserDashboard() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<any[]>([])
  const [winnings, setWinnings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [bankDetails, setBankDetails] = useState<any>(null)
  const [receiptData, setReceiptData] = useState({
    transactionId: '',
    receipt: null as File | null
  })
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect("/auth/signin")
    }

    if (status === 'authenticated') {
      loadOrders()
      loadWinnings()
      fetchBankDetails()
      fetchUserProfile()
    }
  }, [status])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      const data = await response.json()
      setUserProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const fetchBankDetails = async () => {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      setBankDetails(data)
    } catch (error) {
      console.error('Error fetching bank details:', error)
    }
  }

  const loadOrders = async () => {
    const ordersData = await getUserOrders()
    setOrders(ordersData)
    setLoading(false)
  }

  const loadWinnings = async () => {
    const winningsData = await getUserWinnings()
    setWinnings(winningsData)
  }

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setReceiptData({ ...receiptData, receipt: file })
    
    const reader = new FileReader()
    reader.onloadend = () => {
      setReceiptPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmitReceipt = async (orderId: string) => {
    if (!receiptData.transactionId || !receiptData.receipt) {
      setSubmitError('Transaction ID and receipt are required')
      return
    }

    setCurrentOrderId(orderId)
    setIsSubmitting(true)
    setSubmitError('')

    try {
      const formData = new FormData()
      formData.append('transactionId', receiptData.transactionId)
      formData.append('receipt', receiptData.receipt)

      const response = await fetch(`/api/orders/${orderId}/bank-transfer`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit receipt')
      }

      setSubmitSuccess(true)
      setTimeout(() => {
        setShowReceiptModal(false)
        setReceiptData({ transactionId: '', receipt: null })
        setReceiptPreview(null)
        setSubmitSuccess(false)
        loadOrders()
      }, 2000)
    } catch (err: any) {
      setSubmitError(err.message)
    } finally {
      setCurrentOrderId(null)
      setIsSubmitting(false)
    }
  }

  const openReceiptModal = (orderId: string) => {
    setCurrentOrderId(orderId)
    setShowReceiptModal(true)
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

      {/* Missing Mobile Warning Banner */}
      {userProfile && !userProfile.mobile && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                ⚠️ Please add your mobile number to place orders and receive important notifications.
              </p>
              <a href="/dashboard/profile" className="text-yellow-800 dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100 text-sm font-medium">
                Add Mobile →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* User Navigation */}
      <nav className="bg-white dark:bg-gray-900 border-b dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex gap-6 py-4">
            <a href="/dashboard" className="text-blue-600 dark:text-blue-400 font-medium">My Orders</a>
            <a href="/dashboard/winnings" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">My Winnings</a>
            <a href="/dashboard/coupons" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">My Coupons</a>
            <a href="/dashboard/profile" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Profile</a>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Orders</h1>
          <a href="/products" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
            Shop More
          </a>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No orders yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Start shopping to see your orders here</p>
            <a href="/products" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Browse Products
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => (
              <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{order.product.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Order ID: {order.id.slice(0, 8)}...</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    order.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                    order.status === 'APPROVED' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                    order.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                    order.status === 'PENDING_PAYMENT' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400' :
                    order.status === 'CANCELLED' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Quantity</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{order.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{order.currency} {Number(order.total).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{order.paymentMethod.replace('_', ' ')}</p>
                  </div>
                </div>

                {order.status === 'PENDING_PAYMENT' && (
                  <div className="border-t dark:border-gray-700 pt-4">
                    <p className="text-sm text-orange-600 dark:text-orange-400 font-medium mb-2">
                      ⚠️ Payment pending - Submit your bank transfer receipt
                    </p>
                    <button
                      onClick={() => openReceiptModal(order.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      Submit Receipt
                    </button>
                  </div>
                )}

                {order.coupons && order.coupons.length > 0 ? (
                  <div className="border-t dark:border-gray-700 pt-4">
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">
                      ✓ {order.coupons.length} coupon(s) generated
                    </p>
                    <a href="/dashboard/coupons" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm">
                      View your coupons →
                    </a>
                  </div>
                ) : order.status === 'APPROVED' ? (
                  <div className="border-t dark:border-gray-700 pt-4">
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">
                      ✓ Order approved! Coupons will be generated soon
                    </p>
                  </div>
                ) : order.status === 'PENDING_APPROVAL' && (
                  <div className="border-t dark:border-gray-700 pt-4">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      ⏳ Waiting for bank transfer approval
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Receipt Submission Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 relative">
            <button
              onClick={() => setShowReceiptModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Submit Bank Transfer Receipt</h2>

            {/* Bank Transfer Information */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Bank Account Details</h3>
              {bankDetails ? (
                <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  <p><strong>Bank:</strong> {bankDetails.bankName || 'Not configured'}</p>
                  <p><strong>Account Number:</strong> {bankDetails.accountNumber || 'Not configured'}</p>
                  <p><strong>Account Name:</strong> {bankDetails.accountName || 'Not configured'}</p>
                  <p><strong>Branch:</strong> {bankDetails.branch || 'Not configured'}</p>
                </div>
              ) : (
                <p className="text-sm text-blue-700 dark:text-blue-300 italic">Bank account details not configured. Please contact admin.</p>
              )}
            </div>

            {submitSuccess ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✅</div>
                <p className="text-green-600 dark:text-green-400 font-medium">Receipt submitted successfully!</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmitReceipt(currentOrderId!); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Transaction ID *
                  </label>
                  <input
                    type="text"
                    value={receiptData.transactionId}
                    onChange={(e) => setReceiptData({ ...receiptData, transactionId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter transaction ID from bank receipt"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bank Receipt *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition">
                    <input
                      type="file"
                      id="modal-receipt"
                      accept="image/*"
                      onChange={handleReceiptChange}
                      className="hidden"
                    />
                    <label htmlFor="modal-receipt" className="cursor-pointer">
                      {receiptPreview ? (
                        <img
                          src={receiptPreview}
                          alt="Receipt preview"
                          className="max-h-48 mx-auto rounded"
                        />
                      ) : (
                        <div>
                          <div className="text-4xl mb-2">📄</div>
                          <p className="text-gray-600 dark:text-gray-400">Click to upload receipt image</p>
                          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {submitError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Receipt'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
