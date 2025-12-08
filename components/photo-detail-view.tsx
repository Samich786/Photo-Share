'use client'

import { sanitizeImage } from '@/utils/sanitize-image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from './toast'
import { 
  Loader2, 
  ImageOff, 
  Video, 
  Image, 
  Edit3, 
  Trash2, 
  X, 
  Save, 
  MapPin, 
  Users, 
  Star, 
  MessageCircle, 
  Send,
  Clock,
  User,
  FileText
} from 'lucide-react'

// Helper: Extract Cloudinary cloud name from URL
function extractCloudName(url: string): string {
  const match = url.match(/cloudinary\.com\/([^/]+)\//)
  return match ? match[1] : ''
}

// Helper: Extract Cloudinary public ID from URL
function extractCloudinaryPublicId(url: string): string {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/)
  if (match) {
    return match[1]
  }
  return ''
}

interface User {
  id: string
  email: string
  role: string
}

interface Comment {
  id: string
  text: string
  user: { id: string; email: string }
  rating?: number
  createdAt: string
}

export default function PhotoDetailView({
  photoId,
}: {
  photoId: string;
}) {
  const router = useRouter()
  const { showToast } = useToast()
  const [photo, setPhoto] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [ratingValue, setRatingValue] = useState(0)
  const [user, setUser] = useState<User | null>(null)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  
  // Post edit state
  const [editingPost, setEditingPost] = useState(false)
  const [postForm, setPostForm] = useState({
    title: '',
    caption: '',
    location: '',
    people: '',
  })
  const [savingPost, setSavingPost] = useState(false)
  const [deletingPost, setDeletingPost] = useState(false)

  async function fetchUser() {
    const res = await fetch('/api/auth/me')
    if (res.ok) {
      const data = await res.json()
      setUser(data.user)
    }
  }

  async function fetchPhoto() {
    setLoading(true)
    const res = await fetch(`/api/photos/${photoId}`)
    if (!res.ok) {
      setLoading(false)
      return
    }

    const data = await res.json()
    setPhoto(data)
    setPostForm({
      title: data.title || '',
      caption: data.caption || '',
      location: data.location || '',
      people: data.people?.join(', ') || '',
    })
    setLoading(false)
  }

  useEffect(() => {
    fetchUser()
    fetchPhoto()
  }, [photoId])

  async function updatePost() {
    if (!postForm.title.trim()) {
      showToast('Title is required', 'warning')
      return
    }

    setSavingPost(true)
    try {
      const res = await fetch(`/api/photos/${photoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postForm.title,
          caption: postForm.caption,
          location: postForm.location,
          people: postForm.people.split(',').map(p => p.trim()).filter(Boolean),
        }),
      })

      if (res.ok) {
        setEditingPost(false)
        showToast('Post updated!', 'success')
        fetchPhoto()
      } else {
        const data = await res.json()
        showToast(data.error || 'Failed to update post', 'error')
      }
    } catch {
      showToast('Failed to update post', 'error')
    } finally {
      setSavingPost(false)
    }
  }

  async function deletePost() {
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) {
      return
    }

    setDeletingPost(true)
    try {
      const res = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        showToast('Post deleted successfully', 'success')
        router.push('/')
      } else {
        const data = await res.json()
        showToast(data.error || 'Failed to delete post', 'error')
      }
    } catch {
      showToast('Failed to delete post', 'error')
    } finally {
      setDeletingPost(false)
    }
  }

  async function submitComment() {
    if (!commentText.trim()) {
      showToast('Comment cannot be empty', 'warning')
      return
    }

    const res = await fetch(`/api/photos/${photoId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: commentText }),
    })

    if (res.ok) {
      setCommentText('')
      showToast('Comment added!', 'success')
      fetchPhoto()
    } else {
      showToast('Failed to add comment', 'error')
    }
  }

  async function updateComment(commentId: string) {
    if (!editText.trim()) {
      showToast('Comment cannot be empty', 'warning')
      return
    }

    const res = await fetch(`/api/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: editText }),
    })

    if (res.ok) {
      setEditingCommentId(null)
      setEditText('')
      showToast('Comment updated!', 'success')
      fetchPhoto()
    } else {
      const data = await res.json()
      showToast(data.error || 'Failed to update comment', 'error')
    }
  }

  async function deleteComment(commentId: string) {
    if (!confirm('Are you sure you want to delete this comment?')) return

    const res = await fetch(`/api/comments/${commentId}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      showToast('Comment deleted', 'success')
      fetchPhoto()
    } else {
      const data = await res.json()
      showToast(data.error || 'Failed to delete comment', 'error')
    }
  }

  async function submitRating(value: number) {
    const res = await fetch(`/api/photos/${photoId}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    })

    if (res.ok) {
      setRatingValue(value)
      showToast(`Rated ${value} stars!`, 'success')
      fetchPhoto()
    } else {
      showToast('Failed to rate', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
        <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm">Loading...</p>
      </div>
    )
  }
  
  if (!photo) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
          <ImageOff className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 dark:text-gray-400">Media not found</p>
      </div>
    )
  }

  const isVideo = photo.mediaType === 'video'
  const videoUrl = photo.videoUrl || ''

  return (
    <div className="space-y-6">
      {/* Media (Image or Video) */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl -mx-3 sm:mx-0 bg-black">
        {isVideo && videoUrl ? (
          <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
            <iframe
              src={`https://player.cloudinary.com/embed/?public_id=${extractCloudinaryPublicId(videoUrl)}&cloud_name=${extractCloudName(videoUrl)}&player[fluid]=true&player[controls]=true`}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              style={{ border: 'none' }}
            />
          </div>
        ) : isVideo ? (
          <video
            key={videoUrl}
            src={videoUrl}
            controls
            playsInline
            className="w-full max-h-[300px] sm:max-h-[450px] md:max-h-[550px] object-contain mx-auto"
            poster={photo.thumbnailUrl || undefined}
          />
        ) : (
          <img
            src={sanitizeImage(photo.imageUrl)}
            alt={photo.title}
            className="w-full max-h-[300px] sm:max-h-[450px] md:max-h-[550px] object-cover"
          />
        )}
        {/* Media type badge */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-xl backdrop-blur-sm ${
            isVideo ? 'bg-red-500/90 text-white' : 'bg-violet-500/90 text-white'
          }`}>
            {isVideo ? <Video className="w-4 h-4" /> : <Image className="w-4 h-4" />}
            {isVideo ? 'Video' : 'Photo'}
          </span>
        </div>
      </div>

      {/* Creator Actions - Edit/Delete */}
      {user && photo.creator?.id === user.id && (
        <div className="flex gap-3">
          <button
            onClick={() => setEditingPost(!editingPost)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 active:scale-95 transition text-sm font-medium"
          >
            {editingPost ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            {editingPost ? 'Cancel' : 'Edit Post'}
          </button>
          <button
            onClick={deletePost}
            disabled={deletingPost}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 active:scale-95 transition disabled:opacity-50 text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            {deletingPost ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )}

      {/* Edit Post Form */}
      {editingPost && (
        <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-2xl space-y-4 border border-gray-200 dark:border-gray-700 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-violet-500" />
            Edit Post
          </h3>
          
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="w-4 h-4" />
              Title *
            </label>
            <input
              type="text"
              value={postForm.title}
              onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="Enter title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Caption</label>
            <textarea
              value={postForm.caption}
              onChange={(e) => setPostForm({ ...postForm, caption: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Write a caption..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              <input
                type="text"
                value={postForm.location}
                onChange={(e) => setPostForm({ ...postForm, location: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="Where was this?"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Users className="w-4 h-4" />
                Tagged People
              </label>
              <input
                type="text"
                value={postForm.people}
                onChange={(e) => setPostForm({ ...postForm, people: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="Comma separated names"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setEditingPost(false)}
              className="flex-1 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={updatePost}
              disabled={savingPost}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium hover:from-violet-700 hover:to-fuchsia-700 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {savingPost ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Details Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-gray-700 shadow-md">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{photo.title}</h1>
        {photo.caption && (
          <p className="text-gray-600 dark:text-gray-300 mt-2">{photo.caption}</p>
        )}
        
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
          {photo.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {photo.location}
            </span>
          )}
          {photo.people?.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {photo.people.join(', ')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
          <User className="w-4 h-4" />
          <span>Uploaded by <strong className="text-gray-700 dark:text-gray-300">{photo.creator?.email}</strong></span>
        </div>
      </div>

      {/* Rating Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-gray-700 shadow-md">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-yellow-500" />
          Rate this
        </h2>

        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => submitRating(value)}
              className={`flex-1 min-w-[60px] inline-flex items-center justify-center gap-1 px-4 py-3 rounded-xl transition font-medium ${
                ratingValue === value 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white scale-105 shadow-lg shadow-yellow-500/25' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 active:scale-95'
              }`}
            >
              {value}
              <Star className={`w-4 h-4 ${ratingValue === value ? 'fill-white' : ''}`} />
            </button>
          ))}
        </div>

        <p className="mt-4 text-gray-600 dark:text-gray-300 flex items-center gap-2">
          Average: 
          <span className="inline-flex items-center gap-1 font-bold text-yellow-600 dark:text-yellow-400">
            {photo.avgRating?.toFixed(1) || 'N/A'}
            <Star className="w-4 h-4 fill-current" />
          </span>
        </p>
      </div>

      {/* Comments Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-gray-700 shadow-md">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-violet-500" />
          Comments
          <span className="ml-auto text-sm font-normal text-gray-500 dark:text-gray-400">
            {photo.comments?.length || 0}
          </span>
        </h2>

        {/* Add comment */}
        {user ? (
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitComment()}
            />
            <button
              onClick={submitComment}
              disabled={!commentText.trim()}
              className="px-4 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:from-violet-700 hover:to-fuchsia-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="text-center py-4 px-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-6">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Please <a href="/login" className="text-violet-600 dark:text-violet-400 hover:underline font-medium">login</a> to add a comment.
            </p>
          </div>
        )}

        {/* List comments */}
        <div className="space-y-3">
          {(!photo.comments || photo.comments.length === 0) && (
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-6">No comments yet. Be the first to comment!</p>
          )}

          {photo.comments?.map((c: Comment) => (
            <div key={c.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm truncate">{c.user.email}</p>
                  
                  {editingCommentId === c.id ? (
                    <div className="mt-2 space-y-2">
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg text-sm"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateComment(c.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium"
                        >
                          <Save className="w-3 h-3" />
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingCommentId(null)
                            setEditText('')
                          }}
                          className="px-3 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300 mt-1 text-sm break-words">{c.text}</p>
                  )}

                  {c.rating && (
                    <p className="inline-flex items-center gap-1 text-xs mt-2 text-yellow-600 dark:text-yellow-400">
                      <Star className="w-3 h-3 fill-current" />
                      {c.rating}
                    </p>
                  )}

                  <p className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mt-2 ml-2">
                    <Clock className="w-3 h-3" />
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Edit/Delete buttons */}
                {user && user.id === c.user.id && editingCommentId !== c.id && (
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => {
                        setEditingCommentId(c.id)
                        setEditText(c.text)
                      }}
                      className="p-2 text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteComment(c.id)}
                      className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
