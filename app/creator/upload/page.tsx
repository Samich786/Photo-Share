import { PhotoUploadForm } from '@/components/photo-upload-form'

export default function UploadPage() {
  return (
    <div className="py-6 sm:py-8 md:py-12">
      <div className="max-w-2xl mx-auto px-3 sm:px-4">
        <div className="text-center mb-6 sm:mb-8">
          <div className="text-3xl sm:text-4xl mb-2">📤</div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Upload Media</h1>
          <p className="text-gray-500 text-sm sm:text-base mt-1">Share your photos and videos with the world</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <PhotoUploadForm />
        </div>
      </div>
    </div>
  )
}
