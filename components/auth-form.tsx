'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from './toast'
import { Mail, Lock, UserCircle, Loader2, AlertCircle, Camera, Eye } from 'lucide-react'

interface AuthFormProps {
  isLogin?: boolean
}

export function AuthForm({ isLogin = false }: AuthFormProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [role, setRole] = useState<'CREATOR' | 'CONSUMER'>('CONSUMER')
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    if (name === 'role') setRole(value as 'CREATOR' | 'CONSUMER')
    else setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const payload = isLogin
        ? formData
        : { ...formData, role }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Authentication failed')

      showToast(isLogin ? 'Welcome back!' : 'Account created successfully!', 'success')

      if (data.user.role === 'CREATOR') {
        router.push('/creator/dashboard')
      } else {
        router.push('/')
      }

      router.refresh()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-5 px-4 sm:px-0">
      <div>
        <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Email</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="email"
            name="email"
            required
            className="w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 transition"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Password</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="password"
            name="password"
            required
            className="w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 transition"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
      </div>

      {!isLogin && (
        <div>
          <label className="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">Account Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('CONSUMER')}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition ${
                role === 'CONSUMER'
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Eye className={`w-6 h-6 ${role === 'CONSUMER' ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400'}`} />
              <div className="text-center">
                <div className={`font-semibold text-sm ${role === 'CONSUMER' ? 'text-violet-700 dark:text-violet-300' : 'text-gray-700 dark:text-gray-300'}`}>
                  Consumer
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Browse & interact</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setRole('CREATOR')}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition ${
                role === 'CREATOR'
                  ? 'border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Camera className={`w-6 h-6 ${role === 'CREATOR' ? 'text-fuchsia-600 dark:text-fuchsia-400' : 'text-gray-400'}`} />
              <div className="text-center">
                <div className={`font-semibold text-sm ${role === 'CREATOR' ? 'text-fuchsia-700 dark:text-fuchsia-300' : 'text-gray-700 dark:text-gray-300'}`}>
                  Creator
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Upload content</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-sm border border-red-100 dark:border-red-800">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white py-3.5 rounded-2xl font-semibold transition disabled:opacity-50 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading...
          </span>
        ) : isLogin ? 'Login' : 'Create Account'}
      </button>

      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        {isLogin ? "Don't have an account? " : 'Already have an account? '}
        <Link
          href={isLogin ? '/register' : '/login'}
          className="text-violet-600 dark:text-violet-400 font-semibold hover:underline"
        >
          {isLogin ? 'Register' : 'Login'}
        </Link>
      </div>
    </form>
  )
}
