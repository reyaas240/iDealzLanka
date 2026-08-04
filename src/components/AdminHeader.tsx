'use client'

import Logo from "@/components/Logo"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import ThemeSwitcher from "@/components/ThemeSwitcher"
import { useLanguage } from "@/contexts/LanguageContext"

interface AdminHeaderProps {
  userName?: string
}

export default function AdminHeader({ userName }: AdminHeaderProps) {
  const { t } = useLanguage()

  return (
    <>
      {/* Admin Header */}
      <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
            <span className="text-gray-700 dark:text-gray-300">{userName}</span>
            <a href="/api/auth/signout" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
              {t('nav.signOut')}
            </a>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="bg-white dark:bg-gray-900 border-b dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex gap-6 py-4">
            <a href="/admin" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Dashboard</a>
            <a href="/admin/products" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Products</a>
            <a href="/admin/orders" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Orders</a>
            <a href="/admin/users" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Users</a>
            <a href="/admin/draws" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Draws</a>
            <a href="/admin/settings" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Settings</a>
          </div>
        </div>
      </nav>
    </>
  )
}
