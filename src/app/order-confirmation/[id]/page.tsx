import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"

async function getOrder(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      product: true,
      bankTransfer: true
    }
  })
  return order
}

export default async function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id)

  if (!order) {
    notFound()
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

      {/* Order Confirmation */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-6">✅</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-8">
              Thank you for your order. Your order has been received and is pending approval.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">Order Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-mono font-semibold">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Product:</span>
                  <span className="font-semibold">{order.product.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-semibold">{order.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-semibold">{order.currency} {Number(order.total).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-semibold">Bank Transfer</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-semibold">{order.bankTransfer?.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold text-yellow-600">Pending Approval</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-lg font-semibold text-yellow-900 mb-2">What happens next?</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-800">
                <li>Our team will verify your bank transfer receipt</li>
                <li>Once approved, your QR coupons will be generated</li>
                <li>You will receive an email with your downloadable QR coupons</li>
                <li>Keep your QR coupons safe for the draw</li>
              </ol>
            </div>

            <div className="space-y-4">
              <Link
                href="/products"
                className="block w-full px-6 py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Continue Shopping
              </Link>
              <Link
                href="/"
                className="block w-full px-6 py-3 border border-gray-300 text-gray-700 text-center rounded-lg hover:bg-gray-50 transition"
              >
                Return to Home
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
