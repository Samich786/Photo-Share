'use client'

import { sanitizeImage } from '@/utils/sanitize-image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from './toast'

// Helper: Extract Cloudinary cloud name from URL
// URL format: https://res.cloudinary.com/{cloud_name}/video/upload/...
function extractCloudName(url: string): string {
  const match = url.match(/cloudinary\.com\/([^/]+)\//)
  return match ? match[1] : ''
}

// Helper: Extract Cloudinary public ID from URL
// URL format: https://res.cloudinary.com/{cloud}/video/upload/v{version}/{folder}/{public_id}.{ext}
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

  // Get logged-in user info
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
    // Populate edit form
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

  // Update post
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

  // Delete post
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

  // Add comment
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

  // Edit comment
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

  // Delete comment
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

  // Add rating
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
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (!photo) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">😢</div>
        <p className="text-gray-500">Media not found</p>
      </div>
    )
  }

  const isVideo = photo.mediaType === 'video'
  const videoUrl = photo.videoUrl || ''

  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-10">
      {/* Media (Image or Video) */}
      <div className="relative rounded-lg sm:rounded-xl overflow-hidden shadow-lg -mx-3 sm:mx-0 bg-black">
        {isVideo && videoUrl ? (
          <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
            {/* Use iframe for Cloudinary video - more reliable */}
            <iframe
              src={`https://player.cloudinary.com/embed/?public_id=${extractCloudinaryPublicId(videoUrl)}&cloud_name=${extractCloudName(videoUrl)}&player[fluid]=true&player[controls]=true`}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              style={{ border: 'none' }}
            />
          </div>
        ) : isVideo ? (
          // Fallback: direct video tag if URL parsing fails
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
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10">
          <span className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full ${
            isVideo ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
          }`}>
            {isVideo ? '🎬 Video' : '📷 Photo'}
          </span>
        </div>
      </div>

      {/* Creator Actions - Edit/Delete */}
      {user && photo.creator?.id === user.id && (
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => setEditingPost(!editingPost)}
            className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition text-sm sm:text-base"
          >
            {editingPost ? '❌ Cancel Edit' : '✏️ Edit Post'}
          </button>
          <button
            onClick={deletePost}
            disabled={deletingPost}
            className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 active:scale-95 transition disabled:opacity-50 text-sm sm:text-base"
          >
            {deletingPost ? 'Deleting...' : '🗑️ Delete'}
          </button>
        </div>
      )}

      {/* Edit Post Form */}
      {editingPost && (
        <div className="bg-gray-50 p-4 sm:p-6 rounded-xl space-y-4">
          <h3 className="text-lg font-semibold">Edit Post</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={postForm.title}
              onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
              className="w-full px-3 py-2.5 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
              placeholder="Enter title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
            <textarea
              value={postForm.caption}
              onChange={(e) => setPostForm({ ...postForm, caption: e.target.value })}
              className="w-full px-3 py-2.5 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              placeholder="Write a caption..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={postForm.location}
                onChange={(e) => setPostForm({ ...postForm, location: e.target.value })}
                className="w-full px-3 py-2.5 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
                placeholder="Where was this?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tagged People</label>
              <input
                type="text"
                value={postForm.people}
                onChange={(e) => setPostForm({ ...postForm, people: e.target.value })}
                className="w-full px-3 py-2.5 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
                placeholder="Comma separated names"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setEditingPost(false)}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 transition text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={updatePost}
              disabled={savingPost}
              className="flex-1 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 text-sm sm:text-base"
            >
              {savingPost ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Details */}
      <div className="space-y-2 sm:space-y-3">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{photo.title}</h1>
        {photo.caption && (
          <p className="text-gray-700 text-sm sm:text-base">{photo.caption}</p>
        )}
        
        <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-gray-500">
          {photo.location && (
            <span className="flex items-center gap-1">
              📍 {photo.location}
            </span>
          )}
          {photo.people?.length > 0 && (
            <span className="flex items-center gap-1">
              👥 {photo.people.join(', ')}
            </span>
          )}
        </div>

        <div className="text-xs sm:text-sm text-gray-600">
          <strong>Uploaded by:</strong> {photo.creator?.email}
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-3 bg-gray-50 p-3 sm:p-4 rounded-lg">
        <h2 className="text-lg sm:text-xl font-semibold">⭐ Rate this</h2>

        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => submitRating(value)}
              className={`flex-1 min-w-[50px] sm:min-w-0 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition text-sm sm:text-base ${
                ratingValue === value 
                  ? 'bg-yellow-500 text-white scale-105' 
                  : 'bg-white border hover:bg-yellow-50 active:scale-95'
              }`}
            >
              {value} ★
            </button>
          ))}
        </div>

        <p className="text-gray-700 text-sm sm:text-base">
          Average: <strong className="text-yellow-600">{photo.avgRating?.toFixed(1) || 'N/A'}</strong> ★
        </p>
      </div>

      {/* Comments */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold">
          💬 Comments ({photo.comments?.length || 0})
        </h2>

        {/* Add comment */}
        {user ? (
          <div className="space-y-2">
            <textarea
              className="w-full border px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Write a comment..."
              rows={2}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button
              onClick={submitComment}
              disabled={!commentText.trim()}
              className="w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              Post Comment
            </button>
          </div>
        ) : (
          <div className="text-gray-500 bg-gray-50 p-4 rounded-lg text-center text-sm sm:text-base">
            Please <a href="/login" className="text-blue-600 hover:underline font-medium">login</a> to add a comment.
          </div>
        )}

        {/* List comments */}
        <div className="space-y-2 sm:space-y-3">
          {(!photo.comments || photo.comments.length === 0) && (
            <p className="text-gray-500 text-sm text-center py-4">No comments yet. Be the first to comment!</p>
          )}

          {photo.comments?.map((c: Comment) => (
            <div key={c.id} className="p-3 sm:p-4 border rounded-lg bg-white">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{c.user.email}</p>
                  
                  {editingCommentId === c.id ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        className="w-full border px-3 py-2 rounded-lg text-sm"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateComment(c.id)}
                          className="px-3 py-1.5 bg-green-600 text-white rounded text-xs sm:text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingCommentId(null)
                            setEditText('')
                          }}
                          className="px-3 py-1.5 bg-gray-200 rounded text-xs sm:text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 mt-1 text-sm sm:text-base break-words">{c.text}</p>
                  )}

                  {c.rating && (
                    <p className="text-xs sm:text-sm mt-1 text-yellow-600">⭐ {c.rating}</p>
                  )}

                  <p className="text-[10px] sm:text-xs text-gray-400 mt-2">
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Edit/Delete buttons - only show for comment owner */}
                {user && user.id === c.user.id && editingCommentId !== c.id && (
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        setEditingCommentId(c.id)
                        setEditText(c.text)
                      }}
                      className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm px-2 py-1"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteComment(c.id)}
                      className="text-red-600 hover:text-red-800 text-xs sm:text-sm px-2 py-1"
                    >
                      🗑️
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
