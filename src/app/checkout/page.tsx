'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import imageCompression from 'browser-image-compression'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SignInModal from '@/components/SignInModal'
import SignUpModal from '@/components/SignUpModal'
import { useSession } from 'next-auth/react'

interface CartItem {
  productId: string
  quantity: number
  name: string
  price: number
  currency: string
  image: string | null
}

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showSignInModal, setShowSignInModal] = useState(false)
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  
  // User form state
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    mobile: '',
    country: 'Sri Lanka'
  })
  
  // Bank transfer form state
  const [bankTransfer, setBankTransfer] = useState({
    transactionId: '',
    receipt: null as File | null
  })
  const [skipPayment, setSkipPayment] = useState(false)
  
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [bankDetails, setBankDetails] = useState<any>(null)

  const handleAuthSuccess = () => {
    // Reload user data after successful authentication
    if (status === 'authenticated' && session?.user) {
      fetchUserProfile()
    }
  }

  useEffect(() => {
    // Check if user is authenticated
    if (status === 'unauthenticated') {
      setShowSignInModal(true)
      // Still fetch cart and bank details even when not authenticated
      fetchCart()
      fetchBankDetails()
      return
    }

    if (status === 'authenticated' && session?.user) {
      // Fetch user profile to pre-fill form
      fetchUserProfile()
    }

    fetchCart()
    fetchBankDetails()
  }, [status, session, router])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const userData = await response.json()
        setUserForm({
          name: userData.name || '',
          email: userData.email || '',
          mobile: userData.mobile || '',
          country: userData.country || 'Sri Lanka'
        })
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart')
      const data = await response.json()
      setItems(data.items || [])
    } catch (error) {
      console.error('Error fetching cart:', error)
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

  // Set loading to false after initial data fetch
  useEffect(() => {
    if (status !== 'loading') {
      setLoading(false)
    }
  }, [status])

  const handleReceiptChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Compress image
      const options = {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        initialQuality: 0.7
      }
      
      const compressedFile = await imageCompression(file, options)
      setBankTransfer({ ...bankTransfer, receipt: compressedFile })
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string)
      }
      reader.readAsDataURL(compressedFile)
    } catch (error) {
      console.error('Error compressing image:', error)
      setErrors({ ...errors, receipt: 'Failed to process image' })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!userForm.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!userForm.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(userForm.email)) {
      newErrors.email = 'Invalid email format'
    }
    if (!userForm.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required'
    } else if (!/^\+?[0-9]{10,15}$/.test(userForm.mobile.replace(/\s/g, ''))) {
      newErrors.mobile = 'Invalid mobile number'
    }

    // Only validate bank transfer if not skipping payment
    if (!skipPayment) {
      if (!bankTransfer.transactionId.trim()) {
        newErrors.transactionId = 'Transaction ID is required'
      }
      if (!bankTransfer.receipt) {
        newErrors.receipt = 'Receipt is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      // Create user and order
      const formData = new FormData()
      formData.append('name', userForm.name)
      formData.append('email', userForm.email)
      formData.append('mobile', userForm.mobile)
      formData.append('country', userForm.country)
      formData.append('skipPayment', skipPayment.toString())
      
      if (!skipPayment) {
        formData.append('transactionId', bankTransfer.transactionId)
        if (bankTransfer.receipt) {
          formData.append('receipt', bankTransfer.receipt)
        }
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        body: formData
      })

      const responseText = await response.text()
      
      if (!response.ok) {
        console.error('Order API error:', responseText)
        try {
          const error = JSON.parse(responseText)
          throw new Error(error.error || 'Failed to create order')
        } catch {
          throw new Error('Failed to create order. Server returned non-JSON response.')
        }
      }

      const data = JSON.parse(responseText)
      
      // Clear cart
      await fetch('/api/cart', { method: 'DELETE' })
      
      // Redirect to order confirmation
      router.push(`/order-confirmation/${data.orderId}`)
    } catch (error) {
      console.error('Error submitting order:', error)
      setErrors({ ...errors, submit: 'Failed to submit order. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading checkout...</div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">Your cart is empty</p>
          <Link href="/products" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Checkout Content */}
      <section className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Contact Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    disabled={status === 'authenticated'}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                      errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } ${status === 'authenticated' ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''}`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                  {status === 'authenticated' && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Contact information from your profile</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    disabled={status === 'authenticated'}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                      errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } ${status === 'authenticated' ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''}`}
                    placeholder="Enter your email"
                  />
                  {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={userForm.mobile}
                    onChange={(e) => setUserForm({ ...userForm, mobile: e.target.value })}
                    disabled={status === 'authenticated'}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                      errors.mobile ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } ${status === 'authenticated' ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''}`}
                    placeholder="+94 XX XXX XXXX"
                  />
                  {errors.mobile && <p className="text-red-600 text-sm mt-1">{errors.mobile}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={userForm.country}
                    onChange={(e) => setUserForm({ ...userForm, country: e.target.value })}
                    disabled={status === 'authenticated'}
                    className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                      status === 'authenticated' ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Bank Transfer Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Bank Transfer Details</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skipPayment}
                    onChange={(e) => setSkipPayment(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Skip for now</span>
                </label>
              </div>
              
              {!skipPayment ? (
                <>
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

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Transaction ID *
                      </label>
                      <input
                        type="text"
                        value={bankTransfer.transactionId}
                        onChange={(e) => setBankTransfer({ ...bankTransfer, transactionId: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                          errors.transactionId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="Enter transaction ID from bank receipt"
                      />
                      {errors.transactionId && <p className="text-red-600 text-sm mt-1">{errors.transactionId}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bank Receipt *
                      </label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition">
                        <input
                          type="file"
                          id="receipt"
                          accept="image/*"
                          onChange={handleReceiptChange}
                          className="hidden"
                        />
                        <label htmlFor="receipt" className="cursor-pointer">
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
                              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">PNG, JPG up to 2MB (auto-compressed)</p>
                            </div>
                          )}
                        </label>
                      </div>
                      {errors.receipt && <p className="text-red-600 text-sm mt-1">{errors.receipt}</p>}
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    You can submit your bank transfer receipt later from your dashboard. Your order will be created in "Pending Payment" status.
                  </p>
                </div>
              )}
            </div>

            {errors.submit && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-400">{errors.submit}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Processing...' : 'Place Order'}
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4 pb-4 border-b dark:border-gray-700">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm">{item.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {item.currency} {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

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

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  <strong>Note:</strong> Your order will be processed after bank transfer verification. You will receive your QR coupons via email once approved.
                </p>
              </div>
            </div>
          </div>
        </form>
      </section>

      {/* Sign In Modal */}
      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onSwitchToSignUp={() => {
          setShowSignInModal(false)
          setShowSignUpModal(true)
        }}
        onSignInSuccess={handleAuthSuccess}
      />

      {/* Sign Up Modal */}
      <SignUpModal
        isOpen={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
        onSwitchToSignIn={() => {
          setShowSignUpModal(false)
          setShowSignInModal(true)
        }}
        onSignUpSuccess={handleAuthSuccess}
      />

      <Footer />
    </div>
  )
}
