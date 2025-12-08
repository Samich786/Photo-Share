'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { sanitizeImage } from '@/utils/sanitize-image'

interface MediaCardProps {
  id: string
  title: string
  imageUrl: string
  videoUrl?: string
  mediaType: 'image' | 'video'
  thumbnailUrl?: string
  commentsCount: number
  ratingsCount: number
}

export function MediaCard({
  id,
  title,
  imageUrl,
  videoUrl,
  mediaType,
  thumbnailUrl,
  commentsCount,
  ratingsCount,
}: MediaCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [videoError, setVideoError] = useState(false)

  const isVideo = mediaType === 'video'
  const actualVideoUrl = videoUrl || ''

  // Generate thumbnail from Cloudinary video URL
  const generatedThumbnail = actualVideoUrl 
    ? actualVideoUrl.replace('/video/upload/', '/video/upload/so_0,w_400,h_400,c_fill/').replace(/\.(mp4|webm|mov)$/i, '.jpg')
    : ''

  const displayThumbnail = thumbnailUrl || generatedThumbnail

  const handleMouseEnter = () => {
    setIsHovering(true)
    if (videoRef.current && isVideo && !videoError) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => {
        // Ignore autoplay errors
      })
    }
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  return (
    <Link href={`/photo/${id}`}>
      <div 
        className="bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group active:scale-[0.98]"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {isVideo ? (
            <>
              {/* Video element - shown on hover */}
              {actualVideoUrl && !videoError && (
                <video
                  ref={videoRef}
                  src={actualVideoUrl}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                    isHovering ? 'opacity-100' : 'opacity-0'
                  }`}
                  onError={() => setVideoError(true)}
                />
              )}
              
              {/* Thumbnail - shown when not hovering or video error */}
              <div className={`w-full h-full transition-opacity duration-300 ${
                isHovering && !videoError ? 'opacity-0' : 'opacity-100'
              }`}>
                {displayThumbnail ? (
                  <img 
                    src={displayThumbnail} 
                    className="w-full h-full object-cover" 
                    alt={title}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Play indicator - hide when hovering and playing */}
              <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
                isHovering && !videoError ? 'opacity-0' : 'opacity-100'
              }`}>
                <div className="bg-black/60 rounded-full p-2 sm:p-3 backdrop-blur-sm">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </>
          ) : (
            <img 
              src={sanitizeImage(imageUrl)} 
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
              alt={title}
              loading="lazy"
            />
          )}
          
          {/* Media type badge */}
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2">
            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded ${
              isVideo ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
            }`}>
              {isVideo ? '🎬' : '📷'}
              <span className="hidden sm:inline ml-1">{isVideo ? 'Video' : 'Photo'}</span>
            </span>
          </div>
        </div>
        
        <div className="p-2 sm:p-3 md:p-4">
          <h3 className="text-sm sm:text-base font-semibold truncate">{title}</h3>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
            💬 {commentsCount} • ⭐ {ratingsCount}
          </p>
        </div>
      </div>
    </Link>
  )
}




