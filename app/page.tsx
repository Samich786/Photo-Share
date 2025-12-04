import { PhotoFeed } from '@/components/photo-feed'

export default function Home() {
  return (
    <main className="py-6 sm:py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">Photo Feed</h1>
        <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6 md:mb-8">Discover amazing photos and videos from creators</p>
        <PhotoFeed />
      </div>
    </main>
  )
}
