'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  className?: string
  showText?: boolean
  asLink?: boolean
  href?: string
}

export default function Logo({ className = '', showText = true, asLink = true, href = '/' }: LogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.logoUrl) {
          setLogoUrl(data.logoUrl)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch logo:', err)
        setLoading(false)
      })
  }, [])

  const logoContent = (
    <div className={`flex items-center gap-2 ${className}`}>
      {loading ? (
        <div className="text-2xl font-bold text-blue-600">iDealioLanka</div>
      ) : logoUrl ? (
        <img 
          src={logoUrl} 
          alt="iDealioLanka Logo" 
          className="h-16 w-auto object-contain"
        />
      ) : (
        <div className="text-2xl font-bold text-blue-600">iDealioLanka</div>
      )}
    </div>
  )

  if (asLink) {
    return <Link href={href}>{logoContent}</Link>
  }

  return logoContent
}
