'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle, ThemeToggleMobile } from './theme-toggle'
import { 
  Home, 
  LayoutDashboard, 
  Upload, 
  User, 
  LogIn, 
  UserPlus, 
  Menu, 
  X,
  Camera
} from 'lucide-react'

interface User {
  id: string
  email: string
  role: 'CREATOR' | 'CONSUMER'
  avatarUrl?: string
  displayName?: string
  username?: string
}

// Avatar component with loading and error states
function UserAvatar({ user, size = 'md' }: { user: User; size?: 'sm' | 'md' }) {
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  
  const sizeClass = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'
  const textSize = size === 'sm' ? 'text-sm' : 'text-base'
  
  const showImage = user.avatarUrl && !imgError
  
  return (
    <div className={`${sizeClass} bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-white dark:ring-gray-800 shadow-md`}>
      {showImage ? (
        <>
          {!imgLoaded && (
            <span className={`text-white font-bold ${textSize}`}>
              {user.email?.[0]?.toUpperCase() || '?'}
            </span>
          )}
          <img 
            src={user.avatarUrl} 
            alt="Avatar" 
            className={`w-full h-full object-cover ${imgLoaded ? 'block' : 'hidden'}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        </>
      ) : (
        <span className={`text-white font-bold ${textSize}`}>
          {user.email?.[0]?.toUpperCase() || '?'}
        </span>
      )}
    </div>
  )
}

export function Navbar() {
  const pathname = usePathname()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch(`/api/auth/me?t=${Date.now()}`, {
          cache: 'no-store'
        })
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

  const isAuthPage = pathname === "/login" || pathname === "/register"
  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
              MediaShare
            </span>
          </Link>

          {/* Desktop Navigation */}
          {loading ? (
            <div className="hidden md:flex items-center gap-2">
              <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1">
              <Link 
                href="/" 
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive('/') 
                    ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Feed</span>
              </Link>

              {user?.role === "CREATOR" && (
                <>
                  <Link 
                    href="/creator/dashboard" 
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive('/creator/dashboard') 
                        ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link 
                    href="/creator/upload" 
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive('/creator/upload') 
                        ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                  </Link>
                </>
              )}

              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />

              <ThemeToggle />

              {user ? (
                <Link 
                  href="/profile" 
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${
                    isActive('/profile')
                      ? 'bg-violet-100 dark:bg-violet-900/50'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <UserAvatar user={user} size="sm" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden lg:inline max-w-[100px] truncate">
                    {user.displayName || user.username || user.email.split('@')[0]}
                  </span>
                </Link>
              ) : (
                !isAuthPage && (
                  <div className="flex items-center gap-2 ml-2">
                    <Link 
                      href="/login" 
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Login</span>
                    </Link>
                    <Link
                      href="/register"
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-xl text-sm font-medium shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Register</span>
                    </Link>
                  </div>
                )
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition"
            aria-label="Toggle menu"
          >
            {showMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${showMenu ? 'max-h-[32rem] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-4 space-y-2">
          {/* User info on mobile */}
          {user && (
            <Link href="/profile" className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl mb-4">
              <UserAvatar user={user} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">
                  {user.displayName || user.username || user.email.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
              </div>
            </Link>
          )}

          <Link 
            href="/" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              isActive('/') 
                ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Feed</span>
          </Link>

          {user?.role === "CREATOR" && (
            <>
              <Link 
                href="/creator/dashboard" 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isActive('/creator/dashboard') 
                    ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link 
                href="/creator/upload" 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isActive('/creator/upload') 
                    ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Upload className="w-5 h-5" />
                <span className="font-medium">Upload</span>
              </Link>
            </>
          )}

          {user && (
            <Link 
              href="/profile" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                isActive('/profile') 
                  ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Profile</span>
            </Link>
          )}

          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <ThemeToggleMobile />
          </div>

          {!user && !isAuthPage && (
            <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link 
                href="/login" 
                className="flex items-center justify-center gap-2 w-full py-3 border-2 border-violet-600 dark:border-violet-500 text-violet-600 dark:text-violet-400 rounded-xl font-semibold hover:bg-violet-50 dark:hover:bg-violet-950 transition"
              >
                <LogIn className="w-5 h-5" />
                <span>Login</span>
              </Link>
              <Link 
                href="/register" 
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/25 transition"
              >
                <UserPlus className="w-5 h-5" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
