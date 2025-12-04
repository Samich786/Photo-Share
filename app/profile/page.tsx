'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/toast'

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

// Profile Avatar with loading state
function ProfileAvatar({ avatarUrl, email }: { avatarUrl: string; email: string }) {
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  
  const showImage = avatarUrl && !imgError
  
  return (
    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
      {showImage ? (
        <>
          {!imgLoaded && (
            <span className="text-2xl sm:text-3xl text-white font-bold">
              {email?.[0]?.toUpperCase() || '?'}
            </span>
          )}
          <img 
            src={avatarUrl} 
            alt="Avatar" 
            className={`w-full h-full object-cover ${imgLoaded ? 'block' : 'hidden'}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        </>
      ) : (
        <span className="text-2xl sm:text-3xl text-white font-bold">
          {email?.[0]?.toUpperCase() || '?'}
        </span>
      )}
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  
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
      // Add cache-busting to ensure fresh data
      const res = await fetch(`/api/profile?t=${Date.now()}`, {
        cache: 'no-store'
      })
      if (res.status === 401) {
        router.push('/login')
        return
      }
      if (res.ok) {
        const data = await res.json()
        console.log('Fetched profile:', data.profile)
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
      showToast('Profile updated successfully!', 'success')
      setEditing(false)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Something went wrong', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be less than 5MB', 'error')
      return
    }

    showToast('Uploading avatar...', 'info')

    const uploadFormData = new FormData()
    uploadFormData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Upload failed' }))
        showToast(error.error || 'Failed to upload avatar', 'error')
        return
      }

      const data = await res.json()
      console.log('Upload response:', data)
      
      if (!data.secure_url) {
        showToast('No image URL returned', 'error')
        return
      }

      const avatarUrl = data.secure_url
      console.log('Updating avatar to:', avatarUrl)

      // Update avatar in database
      const updateRes = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl }),
      })

      const updateData = await updateRes.json()
      console.log('Profile update response:', updateData)

      if (updateRes.ok && updateData.profile?.avatarUrl) {
        setProfile(prev => prev ? { ...prev, avatarUrl: updateData.profile.avatarUrl } : null)
        showToast('Avatar updated!', 'success')
        // Refresh the page to update navbar
        router.refresh()
      } else if (updateRes.ok) {
        // Update succeeded but avatarUrl not in response - use the uploaded URL
        setProfile(prev => prev ? { ...prev, avatarUrl } : null)
        showToast('Avatar updated!', 'success')
        router.refresh()
      } else {
        showToast(updateData.error || 'Failed to save avatar', 'error')
      }
    } catch (err) {
      console.error('Avatar upload error:', err)
      showToast('Failed to upload avatar', 'error')
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <p className="text-gray-500 mb-4">Please login to view your profile</p>
          <Link href="/login" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
        {/* Mobile: Stack vertically, Desktop: Side by side */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <ProfileAvatar avatarUrl={profile.avatarUrl} email={profile.email} />
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 sm:p-2 rounded-full cursor-pointer hover:bg-blue-700 active:scale-95 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <div className="flex-1 text-center sm:text-left w-full">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 mb-2">
              <h1 className="text-lg sm:text-xl font-semibold">
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
              <p className="text-gray-700 text-sm sm:text-base mb-2">{profile.bio}</p>
            )}
            
            {profile.website && (
              <a 
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm hover:underline inline-block"
              >
                🔗 {profile.website}
              </a>
            )}

            <div className="flex justify-center sm:justify-start gap-6 sm:gap-8 mt-4">
              <div className="text-center">
                <span className="font-bold text-xl sm:text-2xl block">{profile.postCount}</span>
                <span className="text-gray-500 text-xs sm:text-sm">posts</span>
              </div>
              <div className="text-center">
                <span className="font-bold text-xl sm:text-2xl block">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </span>
                <span className="text-gray-500 text-xs sm:text-sm">joined</span>
              </div>
            </div>
          </div>
        </div>

        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="w-full mt-4 sm:mt-6 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 active:bg-gray-100 transition text-sm sm:text-base"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4">Edit Profile</h2>
          
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
                className="w-full px-3 sm:px-4 py-2.5 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-3 sm:px-4 py-2.5 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-3 sm:px-4 py-2.5 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
                className="w-full px-3 sm:px-4 py-2.5 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 pt-2 sm:pt-4">
              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  setFormData({
                    username: profile.username || '',
                    displayName: profile.displayName || '',
                    bio: profile.bio || '',
                    website: profile.website || '',
                  })
                }}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 active:bg-gray-100 transition text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:bg-blue-800 transition disabled:opacity-50 text-sm sm:text-base"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {profile.role === 'CREATOR' && (
          <>
            <Link 
              href="/creator/dashboard"
              className="bg-white p-3 sm:p-4 rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] transition text-center"
            >
              <div className="text-xl sm:text-2xl mb-1 sm:mb-2">📊</div>
              <div className="font-medium text-sm sm:text-base">Dashboard</div>
            </Link>
            <Link 
              href="/creator/upload"
              className="bg-white p-3 sm:p-4 rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] transition text-center"
            >
              <div className="text-xl sm:text-2xl mb-1 sm:mb-2">📤</div>
              <div className="font-medium text-sm sm:text-base">Upload</div>
            </Link>
          </>
        )}
        <Link 
          href="/"
          className="bg-white p-3 sm:p-4 rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] transition text-center"
        >
          <div className="text-xl sm:text-2xl mb-1 sm:mb-2">🏠</div>
          <div className="font-medium text-sm sm:text-base">Feed</div>
        </Link>
      </div>
    </div>
  )
}

