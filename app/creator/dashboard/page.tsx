import Link from 'next/link'
import { CreatorPhotoList } from '@/components/creator-photo-list'

export default function CreatorDashboard() {
  return (
    <div className="py-6 sm:py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">📊 My Media</h1>
            <p className="text-gray-500 text-sm sm:text-base mt-1">Manage your photos and videos</p>
          </div>
          <Link
            href="/creator/upload"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-semibold text-center transition text-sm sm:text-base"
          >
            + Upload New
          </Link>
        </div>
        <CreatorPhotoList />
      </div>
    </div>
  )
}
