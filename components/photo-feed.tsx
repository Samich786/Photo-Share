'use client'

import { useEffect, useState } from 'react'
import { MediaCard } from './media-card'
import { Search, Loader2, ImageOff } from 'lucide-react'

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
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          placeholder="Search photos and videos..."
          className="w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 transition shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchPhotos()}
        />
        <button
          onClick={fetchPhotos}
          type="button"
          className="absolute inset-y-0 right-0 pr-2 flex items-center"
        >
          <span className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl text-sm font-medium hover:from-violet-700 hover:to-fuchsia-700 transition shadow-md shadow-violet-500/25">
            Search
          </span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
          <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm">Loading content...</p>
        </div>
      )}

      {/* Photo Grid */}
      {!loading && photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
      )}

      {/* Empty State */}
      {!loading && photos.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
            <ImageOff className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">No media found</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  )
}
