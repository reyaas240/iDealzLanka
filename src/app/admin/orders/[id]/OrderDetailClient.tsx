'use client'

import { useState } from "react"
import AdminHeader from "@/components/AdminHeader"

export default function OrderDetailClient({ order, session }: { order: any; session: any }) {
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showQrModal, setShowQrModal] = useState(false)
  const [selectedQrCode, setSelectedQrCode] = useState<{ url: string; code: string } | null>(null)

  const handleApprove = async () => {
    setApproving(true)
    setError('')
    setSuccess('')
    
    try {
      const response = await fetch(`/api/admin/bank-transfers/${order.bankTransfer?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED', adminNotes: '' })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to approve receipt')
      }

      setSuccess('Receipt approved successfully!')
      setTimeout(() => window.location.reload(), 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setApproving(false)
    }
  }

  const handleReject = async () => {
    setRejecting(true)
    setError('')
    setSuccess('')
    
    try {
      const response = await fetch(`/api/admin/bank-transfers/${order.bankTransfer?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED', adminNotes })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to reject receipt')
      }

      setSuccess('Receipt rejected successfully!')
      setShowRejectModal(false)
      setTimeout(() => window.location.reload(), 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setRejecting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader userName={session.user?.name || undefined} />

      {/* Order Detail Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <a href="/admin/orders" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4 inline-block">
            &larr; Back to Orders
          </a>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order Details</h1>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Order Information</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Order ID:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100">{order.id.slice(0, 8)}...</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Status:</span>
                <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  order.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                  order.status === 'APPROVED' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                  order.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                  order.status === 'CANCELLED' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                }`}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Total:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100">{order.currency} {Number(order.total).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Payment Method:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100">{order.paymentMethod}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Created At:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100" suppressHydrationWarning>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Customer Information</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Name:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100">{order.user.name}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Email:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100">{order.user.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Mobile:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100">{order.user.mobile}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Country:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100">{order.user.country || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Product Information</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Product:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100">{order.product.name}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Quantity:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100">{order.quantity}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Price per unit:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100">{order.currency} {Number(order.product.price).toLocaleString()}</span>
              </div>
              {order.product.description && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Description:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">{order.product.description}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bank Transfer Information */}
          {order.bankTransfer && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Bank Transfer Details</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Transaction ID:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">{order.bankTransfer.transactionId}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Status:</span>
                  <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    order.bankTransfer.status === 'APPROVED' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                    order.bankTransfer.status === 'REJECTED' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                  }`}>
                    {order.bankTransfer.status}
                  </span>
                </div>
                {order.bankTransfer.receiptUrl && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Receipt:</span>
                    <button
                      type="button"
                      onClick={() => setShowReceiptModal(true)}
                      className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      View Receipt
                    </button>
                  </div>
                )}
                {order.bankTransfer.adminNotes && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Admin Notes:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">{order.bankTransfer.adminNotes}</span>
                  </div>
                )}
                {order.bankTransfer.reviewedAt && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Reviewed At:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100" suppressHydrationWarning>{new Date(order.bankTransfer.reviewedAt).toLocaleString()}</span>
                  </div>
                )}
                {order.bankTransfer.reviewedBy && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Reviewed By:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">{order.bankTransfer.reviewedBy}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {order.bankTransfer.status === 'PENDING' && (
                <div className="mt-6 pt-6 border-t dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Review Receipt</h3>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleApprove}
                      disabled={approving}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {approving ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRejectModal(true)}
                      disabled={rejecting}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {rejecting ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Coupons */}
          {order.coupons && order.coupons.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Coupons</h2>
              <div className="space-y-2">
                {order.coupons.map((coupon: any) => (
                  <div key={coupon.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Code:</span>
                        <span className="ml-2 font-mono font-semibold text-gray-900 dark:text-gray-100">{coupon.couponCode}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          coupon.status === 'ACTIVE' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                          coupon.status === 'USED' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300' :
                          'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                        }`}>
                          {coupon.status}
                        </span>
                        {coupon.qrCodeUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedQrCode({ url: coupon.qrCodeUrl, code: coupon.couponCode })
                              setShowQrModal(true)
                            }}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                          >
                            View QR
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Receipt Preview Modal */}
      {showReceiptModal && order.bankTransfer?.receiptUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Receipt Preview</h3>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-120px)]">
              <img
                src={order.bankTransfer.receiptUrl}
                alt="Receipt"
                className="w-full h-auto"
              />
            </div>
            <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-3">
              <a
                href={order.bankTransfer.receiptUrl}
                download="receipt.jpg"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Download
              </a>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reject Receipt</h3>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Are you sure you want to reject this receipt? This will cancel the order and restore the product inventory.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for rejection (optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Enter reason for rejection..."
                />
              </div>
            </div>
            <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={rejecting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {rejecting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Preview Modal */}
      {showQrModal && selectedQrCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">QR Code</h3>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="p-6 text-center">
              <div className="mb-4">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Coupon Code:</span>
                <p className="font-mono font-semibold text-gray-900 dark:text-white text-lg">{selectedQrCode.code}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg inline-block">
                <img
                  src={selectedQrCode.url}
                  alt="QR Code"
                  className="w-48 h-48 object-contain"
                />
              </div>
            </div>
            <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-3">
              <a
                href={selectedQrCode.url}
                download={`qr-${selectedQrCode.code}.png`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Download
              </a>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
