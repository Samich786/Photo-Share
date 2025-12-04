'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { sanitizeImage } from '@/utils/sanitize-image'

interface Photo {
  id: string
  title: string
  imageUrl: string
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
          <Link key={p.id} href={`/photo/${p.id}`}>
            <div className="bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group active:scale-[0.98]">
              <div className="relative aspect-square">
                {/* Show thumbnail for videos, image for photos */}
                <img 
                  src={sanitizeImage(p.mediaType === 'video' && p.thumbnailUrl ? p.thumbnailUrl : p.imageUrl)} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                  alt={p.title}
                  loading="lazy"
                />
                {/* Video indicator */}
                {p.mediaType === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/60 rounded-full p-2 sm:p-3 backdrop-blur-sm">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                )}
                {/* Media type badge */}
                <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2">
                  <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded ${
                    p.mediaType === 'video' 
                      ? 'bg-red-500 text-white' 
                      : 'bg-blue-500 text-white'
                  }`}>
                    {p.mediaType === 'video' ? '🎬' : '📷'}
                    <span className="hidden sm:inline ml-1">{p.mediaType === 'video' ? 'Video' : 'Photo'}</span>
                  </span>
                </div>
              </div>
              <div className="p-2 sm:p-3 md:p-4">
                <h3 className="text-sm sm:text-base font-semibold truncate">{p.title}</h3>
                <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                  💬 {p._count.comments} • ⭐ {p._count.ratings}
                </p>
              </div>
            </div>
          </Link>
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
