'use client'

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import Logo from "@/components/Logo"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import ThemeSwitcher from "@/components/ThemeSwitcher"
import SignOutButton from "@/components/SignOutButton"
import SignInModal from "@/components/SignInModal"
import SignUpModal from "@/components/SignUpModal"

interface HeaderProps {
  showNav?: boolean
  showCart?: boolean
}

export default function Header({ showNav = true, showCart = false }: HeaderProps) {
  const { data: session, status } = useSession()
  const [signInModalOpen, setSignInModalOpen] = useState(false)
  const [signUpModalOpen, setSignUpModalOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="border-b bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Logo />
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {showNav && (
                <nav className="flex gap-6">
                  <Link href="/products" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Products</Link>
                  <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">About</Link>
                  <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Contact</Link>
                </nav>
              )}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <LanguageSwitcher />
                  <ThemeSwitcher />
                </div>
                {showCart && (
                  <Link href="/cart" className="px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition flex items-center gap-2">
                    🛒 Cart
                  </Link>
                )}
                {status === 'authenticated' && session ? (
                  <>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{session.user?.name || 'User'}</span>
                    </div>
                    <Link href="/dashboard" className="px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition">Dashboard</Link>
                    <SignOutButton />
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setSignInModalOpen(true)}
                      className="px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setSignUpModalOpen(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 dark:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t dark:border-gray-700 pt-4 space-y-4">
              {showNav && (
                <nav className="flex flex-col gap-3">
                  <Link href="/products" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition py-2">Products</Link>
                  <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition py-2">About</Link>
                  <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition py-2">Contact</Link>
                </nav>
              )}
              <div className="flex items-center gap-3 py-2">
                <LanguageSwitcher />
                <ThemeSwitcher />
              </div>
              {showCart && (
                <Link href="/cart" className="block px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition">🛒 Cart</Link>
              )}
              {status === 'authenticated' && session ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{session.user?.name || 'User'}</span>
                  </div>
                  <Link href="/dashboard" className="block px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition">Dashboard</Link>
                  <div className="py-2">
                    <SignOutButton />
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setSignInModalOpen(true)
                      setMobileMenuOpen(false)
                    }}
                    className="w-full px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition text-left"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setSignUpModalOpen(true)
                      setMobileMenuOpen(false)
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Modals */}
      <SignInModal
        isOpen={signInModalOpen}
        onClose={() => setSignInModalOpen(false)}
        onSwitchToSignUp={() => {
          setSignInModalOpen(false)
          setSignUpModalOpen(true)
        }}
      />
      <SignUpModal
        isOpen={signUpModalOpen}
        onClose={() => setSignUpModalOpen(false)}
        onSwitchToSignIn={() => {
          setSignUpModalOpen(false)
          setSignInModalOpen(true)
        }}
      />
    </>
  )
}
