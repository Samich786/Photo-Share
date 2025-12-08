'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MediaCard } from './media-card'
import { Loader2, Upload, ImageOff } from 'lucide-react'

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
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
        <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm">Loading your content...</p>
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
          <ImageOff className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">No content uploaded yet</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">Start sharing your photos and videos with the world</p>
        <Link 
          href="/creator/upload"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition"
        >
          <Upload className="w-5 h-5" />
          Upload your first media
        </Link>
      </div>
    )
  }

  return (
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
  )
}
