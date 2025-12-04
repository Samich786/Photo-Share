'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

interface User {
  id: string
  email: string
  role: 'CREATOR' | 'CONSUMER'
  avatarUrl?: string
  displayName?: string
  username?: string
}

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      }
      finally { setLoading(false) }
    }
    loadUser()
  }, [pathname])

  // Close menu when route changes
  useEffect(() => {
    setShowMenu(false)
  }, [pathname])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setShowMenu(false)
    router.push('/')
    router.refresh()
  }

  const isAuthPage = pathname === "/login" || pathname === "/register"

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex justify-between items-center">

        {/* Logo */}
        <Link href="/" className="text-xl sm:text-2xl font-extrabold text-blue-600">
          📸 MediaShare
        </Link>

        {/* Desktop Navigation */}
        {loading ? (
          <span className="text-gray-400 text-sm hidden md:block">Loading...</span>
        ) : (
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link href="/" className="text-gray-700 hover:text-black transition">
              Feed
            </Link>

            {user?.role === "CREATOR" && (
              <>
                <Link href="/creator/dashboard" className="text-gray-700 hover:text-black transition">
                  Dashboard
                </Link>
                <Link href="/creator/upload" className="text-gray-700 hover:text-black transition">
                  Upload
                </Link>
              </>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <Link 
                  href="/profile" 
                  className="flex items-center gap-2 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-sm font-bold">
                        {user.email[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-700 hidden lg:inline">
                    {user.displayName || user.username || user.email.split('@')[0]}
                  </span>
                </Link>
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hidden lg:inline">{user.role}</span>
                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              !isAuthPage && (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-900 px-3 py-1.5">
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                  >
                    Register
                  </Link>
                </div>
              )
            )}
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="md:hidden text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition"
          aria-label="Toggle menu"
        >
          {showMenu ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu - Slide down animation */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${showMenu ? 'max-h-96' : 'max-h-0'}`}>
        <div className="bg-white border-t px-4 py-3 space-y-1">
          {/* User info on mobile */}
          {user && (
            <div className="flex items-center gap-3 pb-3 mb-2 border-b">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold">
                    {user.email[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {user.displayName || user.username || user.email.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            </div>
          )}

          <Link 
            href="/" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition"
          >
            <span>🏠</span>
            <span>Feed</span>
          </Link>

          {user?.role === "CREATOR" && (
            <>
              <Link 
                href="/creator/dashboard" 
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition"
              >
                <span>📊</span>
                <span>Dashboard</span>
              </Link>
              <Link 
                href="/creator/upload" 
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition"
              >
                <span>📤</span>
                <span>Upload</span>
              </Link>
            </>
          )}

          {user ? (
            <>
              <Link 
                href="/profile" 
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition"
              >
                <span>👤</span>
                <span>Profile</span>
              </Link>
              <div className="pt-2 mt-2 border-t">
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            !isAuthPage && (
              <div className="space-y-2 pt-2">
                <Link 
                  href="/login" 
                  className="block w-full text-center py-2.5 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="block w-full text-center py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Register
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </nav>
  )
}
