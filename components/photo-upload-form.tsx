'use client'

import { useState } from 'react'
import { useToast } from './toast'
import { Upload, MapPin, Users, FileText, Loader2, Image, Video, X } from 'lucide-react'

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
    
    const isVideo = file.type.startsWith('video/')
    setMediaType(isVideo ? 'video' : 'image')
    setMediaFile(file)
    setPreview(URL.createObjectURL(file))
  }

  function clearFile() {
    setMediaFile(null)
    setPreview(null)
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
      setUploadProgress('Uploading media...')
      const { url, mediaType: uploadedType, thumbnailUrl } = await uploadToCloudinary(mediaFile)

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
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          <FileText className="w-4 h-4" />
          Title *
        </label>
        <input
          type="text"
          name="title"
          required
          className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 transition"
          placeholder="Give your post a title"
          value={form.title}
          onChange={handleTextChange}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Caption
        </label>
        <textarea
          name="caption"
          rows={3}
          className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500 transition"
          placeholder="Write a caption..."
          value={form.caption}
          onChange={handleTextChange}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <MapPin className="w-4 h-4" />
            Location
          </label>
          <input
            type="text"
            name="location"
            className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 transition"
            placeholder="Add location"
            value={form.location}
            onChange={handleTextChange}
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <Users className="w-4 h-4" />
            Tag People
          </label>
          <input
            type="text"
            name="people"
            className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 transition"
            placeholder="Names (comma separated)"
            value={form.people}
            onChange={handleTextChange}
          />
        </div>
      </div>

      {/* File Upload */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          <Upload className="w-4 h-4" />
          Photo or Video *
        </label>
        
        {!preview ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center hover:border-violet-500 dark:hover:border-violet-400 transition cursor-pointer bg-gray-50 dark:bg-gray-700/50">
            <input 
              type="file" 
              accept="image/*,video/*" 
              onChange={handleFileChange}
              className="hidden"
              id="media-upload"
            />
            <label htmlFor="media-upload" className="cursor-pointer">
              <div className="flex justify-center gap-4 mb-3">
                <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/50 rounded-2xl flex items-center justify-center">
                  <Image className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="w-12 h-12 bg-fuchsia-100 dark:bg-fuchsia-900/50 rounded-2xl flex items-center justify-center">
                  <Video className="w-6 h-6 text-fuchsia-600 dark:text-fuchsia-400" />
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-medium">Click to upload photo or video</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Images: JPG, PNG, GIF, WEBP (max 10MB)<br/>
                Videos: MP4, WEBM, MOV (max 100MB)
              </p>
            </label>
          </div>
        ) : (
          <div className="relative rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={clearFile}
              className="absolute top-2 right-2 z-10 p-2 bg-black/60 hover:bg-black/80 rounded-xl text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-black/60 rounded-xl text-white text-sm font-medium">
              {mediaType === 'video' ? <Video className="w-4 h-4" /> : <Image className="w-4 h-4" />}
              {mediaType === 'video' ? 'Video' : 'Photo'}
            </div>
            {mediaType === 'video' ? (
              <video 
                src={preview} 
                controls 
                className="w-full h-64 object-cover bg-gray-900"
              />
            ) : (
              <img 
                src={preview} 
                alt="Preview"
                className="w-full h-64 object-cover" 
              />
            )}
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="flex items-center justify-center gap-2 text-violet-600 dark:text-violet-400 font-medium">
          <Loader2 className="w-5 h-5 animate-spin" />
          {uploadProgress}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !mediaFile}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white py-3.5 rounded-2xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
      >
        <Upload className="w-5 h-5" />
        {loading ? 'Uploading...' : `Upload ${mediaType === 'video' ? 'Video' : 'Photo'}`}
      </button>
    </form>
  )
}
