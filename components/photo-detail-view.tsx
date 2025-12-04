'use client'

import { sanitizeImage } from '@/utils/sanitize-image'
import { useEffect, useState } from 'react'

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
  const [photo, setPhoto] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [ratingValue, setRatingValue] = useState(0)
  const [user, setUser] = useState<User | null>(null)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

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
    setLoading(false)
  }

  useEffect(() => {
    fetchUser()
    fetchPhoto()
  }, [photoId])

  // Add comment
  async function submitComment() {
    if (!commentText.trim()) return alert('Comment cannot be empty')

    const res = await fetch(`/api/photos/${photoId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: commentText }),
    })

    if (res.ok) {
      setCommentText('')
      fetchPhoto()
    } else {
      alert('Failed to add comment')
    }
  }

  // Edit comment
  async function updateComment(commentId: string) {
    if (!editText.trim()) return alert('Comment cannot be empty')

    const res = await fetch(`/api/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: editText }),
    })

    if (res.ok) {
      setEditingCommentId(null)
      setEditText('')
      fetchPhoto()
    } else {
      const data = await res.json()
      alert(data.error || 'Failed to update comment')
    }
  }

  // Delete comment
  async function deleteComment(commentId: string) {
    if (!confirm('Are you sure you want to delete this comment?')) return

    const res = await fetch(`/api/comments/${commentId}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      fetchPhoto()
    } else {
      const data = await res.json()
      alert(data.error || 'Failed to delete comment')
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
      fetchPhoto()
    } else {
      alert('Failed to rate')
    }
  }

  if (loading) return <p className="text-center py-8">Loading...</p>
  if (!photo) return <p className="text-center py-8">Media not found</p>

  const isVideo = photo.mediaType === 'video'

  return (
    <div className="space-y-10">
      {/* Media (Image or Video) */}
      <div className="relative rounded-xl overflow-hidden shadow-lg">
        {isVideo ? (
          <video
            src={photo.imageUrl}
            controls
            className="w-full max-h-[550px] object-contain bg-black"
            poster={photo.thumbnailUrl}
          />
        ) : (
          <img
            src={sanitizeImage(photo.imageUrl)}
            alt={photo.title}
            className="w-full max-h-[550px] object-cover"
          />
        )}
        {/* Media type badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            isVideo ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
          }`}>
            {isVideo ? '🎬 Video' : '📷 Photo'}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">{photo.title}</h1>
        <p className="text-gray-700">{photo.caption}</p>
        
        {photo.location && (
          <p className="text-gray-500 text-sm flex items-center gap-1">
            📍 {photo.location}
          </p>
        )}

        {photo.people?.length > 0 && (
          <div className="text-sm text-gray-600">
            <strong>👥 People:</strong> {photo.people.join(', ')}
          </div>
        )}

        <div className="text-sm text-gray-600">
          <strong>Uploaded by:</strong> {photo.creator?.email}
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold">⭐ Rating</h2>

        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => submitRating(value)}
              className={`px-4 py-2 rounded-lg transition ${
                ratingValue === value 
                  ? 'bg-yellow-500 text-white scale-110' 
                  : 'bg-white border hover:bg-yellow-50'
              }`}
            >
              {value} ★
            </button>
          ))}
        </div>

        <p className="text-gray-700">
          Average Rating: <strong>{photo.avgRating?.toFixed(1) || 'N/A'}</strong> ★
        </p>
      </div>

      {/* Comments */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">💬 Comments ({photo.comments?.length || 0})</h2>

        {/* Add comment */}
        {user ? (
          <div className="space-y-2">
            <textarea
              className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Write a comment..."
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />

            <button
              onClick={submitComment}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Post Comment
            </button>
          </div>
        ) : (
          <p className="text-gray-500 bg-gray-50 p-4 rounded-lg">
            Please <a href="/login" className="text-blue-600 hover:underline">login</a> to add a comment.
          </p>
        )}

        {/* List comments */}
        <div className="space-y-3">
          {(!photo.comments || photo.comments.length === 0) && (
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          )}

          {photo.comments?.map((c: Comment) => (
            <div key={c.id} className="p-4 border rounded-lg bg-white hover:shadow-sm transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{c.user.email}</p>
                  
                  {editingCommentId === c.id ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        className="w-full border px-3 py-2 rounded-lg"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateComment(c.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingCommentId(null)
                            setEditText('')
                          }}
                          className="px-3 py-1 bg-gray-300 rounded text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 mt-1">{c.text}</p>
                  )}

                  {c.rating && (
                    <p className="text-sm mt-1 text-yellow-600">⭐ {c.rating}</p>
                  )}

                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Edit/Delete buttons - only show for comment owner */}
                {user && user.id === c.user.id && editingCommentId !== c.id && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingCommentId(c.id)
                        setEditText(c.text)
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deleteComment(c.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      🗑️ Delete
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
