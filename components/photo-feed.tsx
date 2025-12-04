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
    <div className="space-y-6">
      <input
        placeholder="Search photos and videos..."
        className="border px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && fetchPhotos()}
      />

      {loading && <p className="text-center text-gray-500">Loading...</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {photos.map((p) => (
          <Link key={p.id} href={`/photo/${p.id}`}>
            <div className="border rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition group">
              <div className="relative">
                {/* Show thumbnail for videos, image for photos */}
                <img 
                  src={sanitizeImage(p.mediaType === 'video' && p.thumbnailUrl ? p.thumbnailUrl : p.imageUrl)} 
                  className="w-full h-64 object-cover group-hover:scale-105 transition duration-300" 
                  alt={p.title}
                />
                {/* Video indicator */}
                {p.mediaType === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/50 rounded-full p-3">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                )}
                {/* Media type badge */}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    p.mediaType === 'video' 
                      ? 'bg-red-500 text-white' 
                      : 'bg-blue-500 text-white'
                  }`}>
                    {p.mediaType === 'video' ? '🎬 Video' : '📷 Photo'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold truncate">{p.title}</h3>
                <p className="text-gray-500 text-sm">
                  {p._count.comments} comments • {p._count.ratings} ratings
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {!loading && photos.length === 0 && (
        <p className="text-center text-gray-500 py-8">No media found</p>
      )}
    </div>
  )
}
