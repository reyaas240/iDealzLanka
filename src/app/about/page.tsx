'use client'

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useSession } from "next-auth/react"
import Link from "next/link"

export default function AboutPage() {
  const { data: session, status } = useSession()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* About Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">About iDealioLanka</h1>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Our Mission</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              iDealioLanka is dedicated to supporting charitable causes across Sri Lanka while giving our customers 
              the exciting opportunity to win amazing prizes. Through our innovative draw campaign products, we create 
              a win-win situation where your purchases support meaningful causes and you get a chance to win cash prizes.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">How It Works</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Purchase Products</h3>
                  <p className="text-gray-600 dark:text-gray-300">Browse our selection of charity products and make a purchase to support worthy causes.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Receive QR Coupons</h3>
                  <p className="text-gray-600 dark:text-gray-300">After payment verification, you'll receive unique QR coupons for each item purchased.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Wait for the Draw</h3>
                  <p className="text-gray-600 dark:text-gray-300">Each product has a scheduled draw date. Winners are selected from valid coupons.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">4</div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Win Prizes</h3>
                  <p className="text-gray-600 dark:text-gray-300">Winners are notified via email and receive their exciting cash prizes.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">💙</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Transparency</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">We conduct fair draws and maintain complete transparency in our operations.</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🤝</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Community</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">We're committed to giving back to the Sri Lankan community through charitable initiatives.</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Integrity</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">We uphold the highest standards of integrity in all our business practices.</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h2>
            <div className="space-y-2 text-gray-600 dark:text-gray-300">
              <p><strong>Email:</strong> info@idealsrilanka.com</p>
              <p><strong>Phone:</strong> +94 11 123 4567</p>
              <p><strong>Address:</strong> Colombo, Sri Lanka</p>
            </div>
            <div className="mt-6">
              <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition">
                Get in touch with us →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
