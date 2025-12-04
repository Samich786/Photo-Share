'use client'

import { useState } from 'react'
import { useToast } from './toast'

type MediaType = 'image' | 'video'

export function PhotoUploadForm() {
  const { showToast } = useToast()
  const [form, setForm] = useState({
    title: '',
    caption: '',
    location: '',
    people: '',
  })

  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaType, setMediaType] = useState<MediaType>('image')
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Determine media type
    const isVideo = file.type.startsWith('video/')
    setMediaType(isVideo ? 'video' : 'image')
    setMediaFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function uploadToCloudinary(file: File) {
    const data = new FormData()
    data.append('file', file)

    setUploadProgress('Uploading...')
    
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: data,
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Upload failed' }))
      throw new Error(error.error || 'Failed to upload media')
    }

    const uploaded = await res.json()
    if (!uploaded.secure_url) {
      throw new Error('No media URL returned from upload')
    }
    
    return {
      url: uploaded.secure_url,
      mediaType: uploaded.mediaType as MediaType,
      thumbnailUrl: uploaded.thumbnailUrl || '',
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!mediaFile) {
      showToast('Please select an image or video', 'warning')
      return
    }

    setLoading(true)

    try {
      // 1) Upload media to Cloudinary
      setUploadProgress('Uploading media...')
      const { url, mediaType: uploadedType, thumbnailUrl } = await uploadToCloudinary(mediaFile)

      // 2) Save in DB via API
      setUploadProgress('Saving...')
      const payload = {
        ...form,
        people: form.people.split(',').map((x) => x.trim()).filter((x) => x),
        imageUrl: url,
        mediaType: uploadedType,
        thumbnailUrl,
      }

      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        showToast('Media uploaded successfully!', 'success')
        // Reset form
        setForm({ title: '', caption: '', location: '', people: '' })
        setMediaFile(null)
        setPreview(null)
        setUploadProgress('')
        window.location.href = '/creator/dashboard'
      } else {
        const error = await res.json().catch(() => ({ error: 'Upload failed' }))
        showToast(error.error || 'Failed to save media', 'error')
      }
    } catch (error: unknown) {
      console.error('Upload error:', error)
      showToast(error instanceof Error ? error.message : 'Failed to upload. Please try again.', 'error')
    } finally {
      setLoading(false)
      setUploadProgress('')
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <input
          type="text"
          name="title"
          required
          className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Give your post a title"
          value={form.title}
          onChange={handleTextChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Caption
        </label>
        <textarea
          name="caption"
          rows={3}
          className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Write a caption..."
          value={form.caption}
          onChange={handleTextChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            name="location"
            className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add location"
            value={form.location}
            onChange={handleTextChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tag People
          </label>
          <input
            type="text"
            name="people"
            className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Names (comma separated)"
            value={form.people}
            onChange={handleTextChange}
          />
        </div>
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photo or Video *
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer">
          <input 
            type="file" 
            accept="image/*,video/*" 
            onChange={handleFileChange}
            className="hidden"
            id="media-upload"
          />
          <label htmlFor="media-upload" className="cursor-pointer">
            {!preview ? (
              <>
                <div className="text-4xl mb-2">📷 🎬</div>
                <p className="text-gray-600">Click to upload photo or video</p>
                <p className="text-xs text-gray-400 mt-1">
                  Images: JPG, PNG, GIF, WEBP (max 10MB)<br/>
                  Videos: MP4, WEBM, MOV (max 100MB)
                </p>
              </>
            ) : (
              <p className="text-blue-600">Click to change file</p>
            )}
          </label>
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div className="relative">
          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            {mediaType === 'video' ? '🎬 Video' : '📷 Photo'}
          </div>
          {mediaType === 'video' ? (
            <video 
              src={preview} 
              controls 
              className="w-full h-64 object-cover rounded-lg"
            />
          ) : (
            <img 
              src={preview} 
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg" 
            />
          )}
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="text-center text-blue-600 font-medium">
          {uploadProgress}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !mediaFile}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Uploading...' : `Upload ${mediaType === 'video' ? 'Video' : 'Photo'}`}
      </button>
    </form>
  )
}
