'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { sanitizeImage } from '@/utils/sanitize-image'
import { Play, Image, MessageCircle, Star, Video } from 'lucide-react'

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
      videoRef.current.play().catch(() => {})
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
        className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden hover:shadow-xl dark:hover:shadow-gray-900/50 transition-all duration-300 group active:scale-[0.98] border border-gray-100 dark:border-gray-700"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
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
                    <Video className="w-12 h-12 text-gray-600" />
                  </div>
                )}
              </div>

              {/* Play indicator */}
              <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
                isHovering && !videoError ? 'opacity-0' : 'opacity-100'
              }`}>
                <div className="bg-black/60 rounded-full p-3 backdrop-blur-sm">
                  <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white" />
                </div>
              </div>
            </>
          ) : (
            <img 
              src={sanitizeImage(imageUrl)} 
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
              alt={title}
              loading="lazy"
            />
          )}
          
          {/* Media type badge */}
          <div className="absolute top-2 left-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg backdrop-blur-sm ${
              isVideo 
                ? 'bg-red-500/90 text-white' 
                : 'bg-violet-500/90 text-white'
            }`}>
              {isVideo ? <Video className="w-3 h-3" /> : <Image className="w-3 h-3" />}
              <span className="hidden sm:inline">{isVideo ? 'Video' : 'Photo'}</span>
            </span>
          </div>
        </div>
        
        <div className="p-3 sm:p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm sm:text-base">{title}</h3>
          <div className="flex items-center gap-3 mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" />
              {commentsCount}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5" />
              {ratingsCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
