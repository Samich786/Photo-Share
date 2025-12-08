import { PhotoUploadForm } from '@/components/photo-upload-form'
import { Upload } from 'lucide-react'

export default function UploadPage() {
  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl shadow-lg shadow-violet-500/25 mb-4">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Upload Media</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Share your photos and videos with the world</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl dark:shadow-gray-900/30 p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
          <PhotoUploadForm />
        </div>
      </div>
    </div>
  )
}
