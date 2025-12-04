'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Profile {
  id: string
  email: string
  role: 'CREATOR' | 'CONSUMER'
  username: string
  displayName: string
  bio: string
  avatarUrl: string
  website: string
  postCount: number
  createdAt: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    bio: '',
    website: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    try {
      const res = await fetch('/api/profile')
      if (res.status === 401) {
        router.push('/login')
        return
      }
      if (res.ok) {
        const data = await res.json()
        setProfile(data.profile)
        setFormData({
          username: data.profile.username || '',
          displayName: data.profile.displayName || '',
          bio: data.profile.bio || '',
          website: data.profile.website || '',
        })
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      setProfile(prev => prev ? { ...prev, ...data.profile } : null)
      setSuccess('Profile updated successfully!')
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        // Update avatar
        const updateRes = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatarUrl: data.secure_url }),
        })

        if (updateRes.ok) {
          setProfile(prev => prev ? { ...prev, avatarUrl: data.secure_url } : null)
          setSuccess('Avatar updated!')
        }
      }
    } catch (err) {
      setError('Failed to upload avatar')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Please login to view your profile</p>
          <Link href="/login" className="text-blue-600 hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
              {profile.avatarUrl ? (
                <img 
                  src={profile.avatarUrl} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl text-white font-bold">
                  {profile.email[0].toUpperCase()}
                </span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarUpload}
              />
            </label>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-semibold">
                {profile.displayName || profile.username || profile.email.split('@')[0]}
              </h1>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                profile.role === 'CREATOR' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {profile.role}
              </span>
            </div>
            
            {profile.username && (
              <p className="text-gray-500 text-sm mb-2">@{profile.username}</p>
            )}
            
            {profile.bio && (
              <p className="text-gray-700 mb-2">{profile.bio}</p>
            )}
            
            {profile.website && (
              <a 
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm hover:underline"
              >
                {profile.website}
              </a>
            )}

            <div className="flex gap-6 mt-4 text-sm">
              <div>
                <span className="font-semibold">{profile.postCount}</span>
                <span className="text-gray-500 ml-1">posts</span>
              </div>
              <div>
                <span className="text-gray-500">Member since </span>
                <span className="font-medium">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="w-full mt-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Edit Form */}
      {editing && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Edit Profile</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="your_username"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">3-30 characters, letters, numbers, underscores</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Your Name"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                maxLength={150}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/150 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://yourwebsite.com"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  setError('')
                  setFormData({
                    username: profile.username || '',
                    displayName: profile.displayName || '',
                    bio: profile.bio || '',
                    website: profile.website || '',
                  })
                }}
                className="flex-1 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        {profile.role === 'CREATOR' && (
          <>
            <Link 
              href="/creator/dashboard"
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition text-center"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">Dashboard</div>
            </Link>
            <Link 
              href="/creator/upload"
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition text-center"
            >
              <div className="text-2xl mb-2">📤</div>
              <div className="font-medium">Upload Media</div>
            </Link>
          </>
        )}
        <Link 
          href="/"
          className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition text-center"
        >
          <div className="text-2xl mb-2">🏠</div>
          <div className="font-medium">Feed</div>
        </Link>
      </div>
    </div>
  )
}

