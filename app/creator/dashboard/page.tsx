import Link from 'next/link'
import { CreatorPhotoList } from '@/components/creator-photo-list'
import { LayoutDashboard, Plus } from 'lucide-react'

export default function CreatorDashboard() {
  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-violet-100 dark:bg-violet-900/50 rounded-2xl">
              <LayoutDashboard className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">My Media</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Manage your photos and videos</p>
            </div>
          </div>
          <Link
            href="/creator/upload"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-6 py-3 rounded-xl font-semibold text-center transition shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
          >
            <Plus className="w-5 h-5" />
            Upload New
          </Link>
        </div>
        <CreatorPhotoList />
      </div>
    </div>
  )
}
