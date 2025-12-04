'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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

export function CreatorPhotoList() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  async function loadPhotos() {
    setLoading(true)
    const res = await fetch('/api/creator/photos')
    const data = await res.json()
    setPhotos(data.photos || [])
    setLoading(false)
  }

  useEffect(() => {
    loadPhotos()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl">
        <div className="text-5xl mb-4">📷</div>
        <p className="text-gray-500 mb-4">You haven&apos;t uploaded any media yet</p>
        <Link 
          href="/creator/upload"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Upload your first media
        </Link>
      </div>
    )
  }

  return (
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
  )
}
