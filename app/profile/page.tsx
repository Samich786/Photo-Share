'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/toast'
import { 
  Camera, 
  LogOut, 
  Edit3, 
  X, 
  Save, 
  LayoutDashboard, 
  Upload, 
  Home,
  Link as LinkIcon,
  MapPin,
  Calendar,
  Images,
  Sparkles,
  Eye,
  Lock
} from 'lucide-react'

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
    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center overflow-hidden ring-4 ring-white dark:ring-gray-800 shadow-xl">
      {showImage ? (
        <>
          {!imgLoaded && (
            <span className="text-3xl sm:text-4xl text-white font-bold">
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
        <span className="text-3xl sm:text-4xl text-white font-bold">
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
  const [loggingOut, setLoggingOut] = useState(false)
  
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
      const res = await fetch(`/api/profile?t=${Date.now()}`, {
        cache: 'no-store'
      })
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

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      showToast('Logged out successfully', 'success')
      router.push('/')
      router.refresh()
    } catch {
      showToast('Failed to logout', 'error')
    } finally {
      setLoggingOut(false)
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

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error')
      return
    }

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
      
      if (!data.secure_url) {
        showToast('No image URL returned', 'error')
        return
      }

      const avatarUrl = data.secure_url

      const updateRes = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl }),
      })

      const updateData = await updateRes.json()

      if (updateRes.ok && updateData.profile?.avatarUrl) {
        setProfile(prev => prev ? { ...prev, avatarUrl: updateData.profile.avatarUrl } : null)
        showToast('Avatar updated!', 'success')
        router.refresh()
      } else if (updateRes.ok) {
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
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-violet-600 border-t-transparent"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
            <Lock className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Please login to view your profile</p>
          <Link href="/login" className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium shadow-lg shadow-violet-500/25">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl dark:shadow-gray-900/30 overflow-hidden border border-gray-100 dark:border-gray-700">
        {/* Cover gradient */}
        <div className="h-28 sm:h-36 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 relative">
          <div className="absolute inset-0 bg-black/10" />
        </div>
        
        {/* Profile content */}
        <div className="px-4 sm:px-6 pb-6">
          {/* Avatar - Positioned to overlap banner */}
          <div className="flex justify-center sm:justify-start -mt-14 sm:-mt-16 mb-4">
            <div className="relative flex-shrink-0">
              <ProfileAvatar avatarUrl={profile.avatarUrl} email={profile.email} />
              <label className="absolute bottom-0 right-0 bg-violet-600 text-white p-2 rounded-xl cursor-pointer hover:bg-violet-700 active:scale-95 transition shadow-lg">
                <Camera className="w-4 h-4" />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>
          </div>

          {/* Name and role badge - Below avatar, not overlapping */}
          <div className="text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {profile.displayName || profile.username || profile.email.split('@')[0]}
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                profile.role === 'CREATOR' 
                  ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md shadow-violet-500/25' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}>
                {profile.role === 'CREATOR' ? <Sparkles className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {profile.role}
              </span>
            </div>
            {profile.username && (
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">@{profile.username}</p>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-gray-600 dark:text-gray-300 mt-4 text-center sm:text-left">{profile.bio}</p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
            {profile.website && (
              <a 
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-violet-600 dark:hover:text-violet-400 transition"
              >
                <LinkIcon className="w-4 h-4" />
                <span className="truncate max-w-[150px]">{profile.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center sm:justify-start gap-6 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-2xl font-bold text-gray-900 dark:text-white">
                <Images className="w-5 h-5 text-violet-500" />
                {profile.postCount}
              </div>
              <span className="text-gray-500 dark:text-gray-400 text-sm">Posts</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setEditing(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-900/50 transition disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{loggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Profile</h2>
              <button
                onClick={() => {
                  setEditing(false)
                  setFormData({
                    username: profile.username || '',
                    displayName: profile.displayName || '',
                    bio: profile.bio || '',
                    website: profile.website || '',
                  })
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="your_username"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 transition"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">3-30 characters, letters, numbers, underscores</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Your Name"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  maxLength={150}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500 transition"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">{formData.bio.length}/150 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Website
                </label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 transition"
                />
              </div>

              <div className="flex gap-3 pt-2">
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
                  className="flex-1 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium hover:from-violet-700 hover:to-fuchsia-700 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {profile.role === 'CREATOR' && (
          <>
            <Link 
              href="/creator/dashboard"
              className="group bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md dark:shadow-gray-900/30 hover:shadow-xl dark:hover:shadow-gray-900/50 active:scale-[0.98] transition border border-gray-100 dark:border-gray-700"
            >
              <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <LayoutDashboard className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="font-semibold text-gray-900 dark:text-white">Dashboard</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">View analytics</div>
            </Link>
            <Link 
              href="/creator/upload"
              className="group bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md dark:shadow-gray-900/30 hover:shadow-xl dark:hover:shadow-gray-900/50 active:scale-[0.98] transition border border-gray-100 dark:border-gray-700"
            >
              <div className="w-10 h-10 bg-fuchsia-100 dark:bg-fuchsia-900/50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <Upload className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" />
              </div>
              <div className="font-semibold text-gray-900 dark:text-white">Upload</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Share content</div>
            </Link>
          </>
        )}
        <Link 
          href="/"
          className="group bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md dark:shadow-gray-900/30 hover:shadow-xl dark:hover:shadow-gray-900/50 active:scale-[0.98] transition border border-gray-100 dark:border-gray-700"
        >
          <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <Home className="w-5 h-5 text-pink-600 dark:text-pink-400" />
          </div>
          <div className="font-semibold text-gray-900 dark:text-white">Feed</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Browse content</div>
        </Link>
      </div>
    </div>
  )
}
