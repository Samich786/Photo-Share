'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from './toast'

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
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 sm:space-y-6 px-4 sm:px-0">
      <div>
        <label className="block mb-1.5 sm:mb-2 font-medium text-sm sm:text-base">Email</label>
        <input
          type="email"
          name="email"
          required
          className="w-full border px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="your@email.com"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="block mb-1.5 sm:mb-2 font-medium text-sm sm:text-base">Password</label>
        <input
          type="password"
          name="password"
          required
          className="w-full border px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      {!isLogin && (
        <div>
          <label className="block mb-1.5 sm:mb-2 font-medium text-sm sm:text-base">Account Type</label>
          <select
            name="role"
            value={role}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
          >
            <option value="CONSUMER">👀 Consumer - Browse & interact</option>
            <option value="CREATOR">📷 Creator - Upload content</option>
          </select>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm">
          ❌ {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-3 sm:py-3.5 rounded-lg font-medium transition disabled:opacity-50 text-sm sm:text-base"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span> Loading...
          </span>
        ) : isLogin ? 'Login' : 'Create Account'}
      </button>

      <div className="text-center text-sm sm:text-base">
        {isLogin ? "Don't have an account? " : 'Already have an account? '}
        <Link
          href={isLogin ? '/register' : '/login'}
          className="text-blue-600 font-semibold hover:underline"
        >
          {isLogin ? 'Register' : 'Login'}
        </Link>
      </div>
    </form>
  )
}
