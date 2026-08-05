'use client'

import { useEffect, useState } from "react"
import Link from "next/link"

interface SiteSettings {
  contactEmail?: string
  contactPhone?: string
  contactAddress?: string
}

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/" className="hover:text-white transition">Home</Link></li>
              <li><Link href="/products" className="hover:text-white transition">Products</Link></li>
              <li><Link href="/about" className="hover:text-white transition">About</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/terms" className="hover:text-white transition">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Email: {loading ? 'Loading...' : settings?.contactEmail || 'info@idealio.lanka'}</li>
              <li>Phone: {loading ? 'Loading...' : settings?.contactPhone || '+94 11 123 4567'}</li>
              <li>{loading ? 'Loading...' : settings?.contactAddress || 'Colombo, Sri Lanka'}</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">About iDealioLanka</h3>
            <p className="text-gray-400 text-sm">
              Supporting charitable causes across Sri Lanka while giving you the chance to win amazing prizes.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 iDealioLanka. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
