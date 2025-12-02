'use client'

import { useState } from 'react'

export function PhotoUploadForm() {
  const [form, setForm] = useState({
    title: '',
    caption: '',
    location: '',
    people: '',
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleTextChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleFileChange(e: any) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function uploadToCloudinary(file: File) {
    const data = new FormData()
    data.append('file', file)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: data,
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Upload failed' }))
      throw new Error(error.error || 'Failed to upload image')
    }

    const uploaded = await res.json()
    if (!uploaded.secure_url) {
      throw new Error('No image URL returned from upload')
    }
    return uploaded.secure_url
  }

  async function handleSubmit(e: any) {
    e.preventDefault()
    if (!imageFile) {
      alert('Please select an image')
      return
    }

    setLoading(true)

    try {
      // 1) Upload image to Cloudinary
      const imageUrl = await uploadToCloudinary(imageFile)

      // 2) Save photo in DB via your existing API
      const payload = {
        ...form,
        people: form.people.split(',').map((x) => x.trim()).filter((x) => x),
        imageUrl,
      }

      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        alert('Photo uploaded successfully!')
        // Reset form
        setForm({ title: '', caption: '', location: '', people: '' })
        setImageFile(null)
        setPreview(null)
        window.location.href = '/creator/dashboard'
      } else {
        const error = await res.json().catch(() => ({ error: 'Upload failed' }))
        alert(error.error || 'Failed to save photo')
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      alert(error.message || 'Failed to upload photo. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>

      <input
        type="text"
        name="title"
        className="w-full border px-4 py-2 rounded"
        placeholder="Title"
        value={form.title}
        onChange={handleTextChange}
      />

      <textarea
        name="caption"
        className="w-full border px-4 py-2 rounded"
        placeholder="Caption"
        value={form.caption}
        onChange={handleTextChange}
      />

      <input
        type="text"
        name="location"
        className="w-full border px-4 py-2 rounded"
        placeholder="Location"
        value={form.location}
        onChange={handleTextChange}
      />

      <input
        type="text"
        name="people"
        className="w-full border px-4 py-2 rounded"
        placeholder="People (comma separated)"
        value={form.people}
        onChange={handleTextChange}
      />

      <input type="file" accept="image/*" onChange={handleFileChange} />

      {preview && (
        <img src={preview} className="w-full h-64 object-cover rounded" />
      )}

      <button
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded"
      >
        {loading ? 'Uploading...' : 'Upload Photo'}
      </button>
    </form>
  )
}
