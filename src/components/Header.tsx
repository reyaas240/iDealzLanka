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

  return (
    <>
      <header className="border-b bg-white dark:bg-gray-900 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          {showNav && (
            <nav className="hidden md:flex gap-6">
              <Link href="/products" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Products</Link>
              <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">About</Link>
              <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Contact</Link>
            </nav>
          )}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
            {showCart && (
              <Link href="/cart" className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition flex items-center gap-2">
                🛒 Cart
              </Link>
            )}
            {status === 'authenticated' && session ? (
              <>
                <Link href="/dashboard" className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition">Dashboard</Link>
                <SignOutButton />
              </>
            ) : (
              <>
                <button
                  onClick={() => setSignInModalOpen(true)}
                  className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
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
