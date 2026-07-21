import Link from "next/link"

export default function TermsPage() {
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

      {/* Terms Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms & Conditions</h1>

          <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-600 leading-relaxed">
                Welcome to iDealzSrilanka. By using our website and services, you agree to comply with and be bound by 
                the following terms and conditions of use. Please read these terms carefully before using our services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Products and Pricing</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                All products listed on our website are draw campaign products. Each purchase supports charitable causes 
                and provides you with unique QR coupons for participation in prize draws.
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Prices are listed in Sri Lankan Rupees (LKR)</li>
                <li>We reserve the right to modify product prices at any time</li>
                <li>All sales are final unless otherwise stated</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Payment and Orders</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We accept bank transfers as our primary payment method. Orders are processed after payment verification.
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Payment must be completed within 24 hours of order placement</li>
                <li>Bank transfer receipts must be provided for verification</li>
                <li>Orders are confirmed only after payment approval</li>
                <li>QR coupons are generated after successful payment verification</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Draw Campaigns and Prizes</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Each product has an associated draw date. Winners are selected randomly from valid coupons.
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Draw dates are specified for each product</li>
                <li>Winners are selected through a fair random process</li>
                <li>Winners are notified via email</li>
                <li>Prizes are awarded to winners as specified</li>
                <li>Decisions on prize allocation are final</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. User Accounts</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Users must register an account to make purchases and participate in draws.
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining account security</li>
                <li>One account per person is permitted</li>
                <li>Account sharing is prohibited</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. QR Coupons</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Each purchased item generates a unique QR coupon that serves as your entry into the draw.
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>QR coupons are unique and non-transferable</li>
                <li>Lost coupons cannot be replaced</li>
                <li>QR codes must be kept secure</li>
                <li>Multiple coupons increase your chances of winning</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy and Data Protection</h2>
              <p className="text-gray-600 leading-relaxed">
                We collect and process your personal data in accordance with our Privacy Policy. By using our services, 
                you consent to the collection and use of your information as described in our Privacy Policy.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed">
                iDealzSrilanka shall not be liable for any indirect, incidental, special, or consequential damages 
                arising from the use of our services or participation in draw campaigns.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify these terms at any time. Continued use of our services after changes 
                constitutes acceptance of the updated terms.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
              <p className="text-gray-600 leading-relaxed">
                For questions about these terms, please contact us at info@idealsrilanka.com
              </p>
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
