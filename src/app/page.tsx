'use client'

import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useLanguage } from "@/contexts/LanguageContext"
import { useState, useEffect } from "react"

export default function Home() {
  const { t } = useLanguage()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState({
    heroImageUrl: null,
    heroTitle: null,
    heroSubtitle: null
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/products/featured').then(res => res.json()),
      fetch('/api/settings').then(res => res.json())
    ]).then(([productsData, settingsData]) => {
      setProducts(productsData)
      setSettings({
        heroImageUrl: settingsData.heroImageUrl,
        heroTitle: settingsData.heroTitle,
        heroSubtitle: settingsData.heroSubtitle
      })
      setLoading(false)
    }).catch(err => {
      console.error('Error fetching data:', err)
      setLoading(false)
    })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 dark:from-gray-900 to-white dark:to-gray-800">
      <Header showCart={true} />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {settings.heroTitle || t('home.hero.title')}
            </h1>
            <p className="text-2xl text-gray-600 dark:text-gray-300 mb-8">
              {settings.heroSubtitle || t('home.hero.subtitle')}
            </p>
            <div className="flex gap-4">
              <Link href="/products" className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
                {t('home.hero.cta')}
              </Link>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-2xl p-8 flex items-center justify-center min-h-[400px]">
            {settings.heroImageUrl ? (
              <img 
                src={settings.heroImageUrl} 
                alt="Hero" 
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="text-center text-blue-800 dark:text-blue-200">
                <div className="text-6xl mb-4">🎁</div>
                <p className="text-xl font-semibold">Hero Image</p>
                <p className="text-sm">Configure in admin panel</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Notice Banner */}
      <section className="bg-yellow-50 border-y border-yellow-200">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-yellow-800 font-medium">
            📢 Welcome to iDealioLanka! Your first draw is coming soon. Stay tuned for exciting prizes!
          </p>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">{t('home.featured.title')}</h2>
        {loading ? (
          <p className="text-center text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">{t('home.noProducts')}</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                {product.images && product.images.length > 0 ? (
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 aspect-[5/4] flex items-center justify-center">
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 aspect-[5/4] flex items-center justify-center">
                    <span className="text-gray-400 dark:text-gray-500">Product Image</span>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      product.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      product.status === 'CLOSED' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                  {product.shortDescription && product.shortDescription.trim() ? (
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{product.shortDescription}</p>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{product.description || 'Support a good cause and win prizes'}</p>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {product.currency} {Number(product.price).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <p>Draw Date: {new Date(product.drawDate).toLocaleDateString()}</p>
                    <p>Available: {product.totalItems - product.soldItems} / {product.totalItems}</p>
                  </div>
                  <Link 
                    href={`/products/${product.id}`} 
                    className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition"
                  >
                    {t('home.viewDetails')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  )
}
