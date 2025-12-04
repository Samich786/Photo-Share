'use client'

import { useEffect, useState } from 'react'
import { MediaCard } from './media-card'

interface Photo {
  id: string
  title: string
  imageUrl: string
  videoUrl?: string
  mediaType?: 'image' | 'video'
  thumbnailUrl?: string
  _count: {
    comments: number
    ratings: number
  }
}

export function PhotoFeed() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  async function fetchPhotos() {
    setLoading(true)
    const res = await fetch(`/api/photos?search=${search}`)
    const data = await res.json()
    setPhotos(data.photos || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchPhotos()
  }, [])

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search Bar */}
      <div className="flex gap-2">
        <input
          placeholder="Search photos and videos..."
          className="flex-1 border px-3 sm:px-4 py-2.5 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchPhotos()}
        />
        <button
          onClick={fetchPhotos}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Photo Grid - Responsive columns */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {photos.map((p) => (
          <MediaCard
            key={p.id}
            id={p.id}
            title={p.title}
            imageUrl={p.imageUrl}
            videoUrl={p.videoUrl}
            mediaType={p.mediaType || 'image'}
            thumbnailUrl={p.thumbnailUrl}
            commentsCount={p._count.comments}
            ratingsCount={p._count.ratings}
          />
        ))}
      </div>

      {/* Empty State */}
      {!loading && photos.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📷</div>
          <p className="text-gray-500">No media found</p>
          <p className="text-gray-400 text-sm mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  )
}
