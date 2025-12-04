'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

interface User {
  id: string
  email: string
  role: 'CREATOR' | 'CONSUMER'
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

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/')
    router.refresh()
  }

  const isAuthPage = pathname === "/login" || pathname === "/register"

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-5 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link href="/" className="text-2xl font-extrabold text-blue-600">
          MediaShare
        </Link>

        {/* If still loading user → avoid unwanted flicker */}
        {loading ? (
          <span className="text-gray-400">Loading...</span>
        ) : (
          <div className="hidden md:flex items-center gap-6">

            {/* Always available */}
            <Link href="/" className="text-gray-700 hover:text-black">
              Feed
            </Link>

            {/* Only Creator sees dashboard + upload */}
            {user?.role === "CREATOR" && (
              <>
                <Link href="/creator/dashboard" className="text-gray-700 hover:text-black">
                  Dashboard
                </Link>

                <Link href="/creator/upload" className="text-gray-700 hover:text-black">
                  Upload
                </Link>
              </>
            )}

            {/* If user logged in */}
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{user.email}</span>
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">{user.role}</span>

                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Logout
                </button>
              </div>
            ) : (
              !isAuthPage && ( /* Hide login/register when already on login/register */
                <div className="flex items-center gap-3">
                  <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-900">
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-800 text-white rounded"
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
          className="md:hidden text-gray-700 text-2xl"
        >
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}
      {showMenu && (
        <div className="md:hidden bg-gray-50 border-t px-4 pb-4 space-y-3">

          <Link href="/" className="block text-gray-600 hover:text-black">
            Feed
          </Link>

          {user?.role === "CREATOR" && (
            <>
              <Link href="/creator/dashboard" className="block text-gray-600 hover:text-black">
                Dashboard
              </Link>
              <Link href="/creator/upload" className="block text-gray-600 hover:text-black">
                Upload
              </Link>
            </>
          )}

          {user ? (
            <button
              onClick={logout}
              className="w-full bg-red-600 text-white py-2 rounded"
            >
              Logout
            </button>
          ) : (
            !isAuthPage && (
              <>
                <Link href="/login" className="block bg-blue-600 text-white text-center py-2 rounded">
                  Login
                </Link>
                <Link href="/register" className="block bg-blue-600 text-white text-center py-2 rounded">
                  Register
                </Link>
              </>
            )
          )}
        </div>
      )}
    </nav>
  )
}
