'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewModPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    longDescription: '',
    price: '',
    isFree: false,
    currency: 'USD',
    gameTitle: '',
    gameCategory: '',
    platform: [],
    tags: [],
    requirements: '',
    images: [],
    videoUrl: '',
  })

  const platforms = ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile', 'Mac', 'Linux']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create mod')
      }

      // Redirect to mod edit page to upload files
      router.push(`/dashboard/mods/${data.data.mod.id}/edit`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePlatformToggle = (platform) => {
    setFormData(prev => ({
      ...prev,
      platform: prev.platform.includes(platform)
        ? prev.platform.filter(p => p !== platform)
        : [...prev.platform, platform]
    }))
  }

  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault()
      if (!formData.tags.includes(e.target.value.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, e.target.value.trim()]
        }))
      }
      e.target.value = ''
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Create New Mod</h1>
        <p className="text-gray-400">Fill in the details for your mod listing</p>
      </div>

      {error && (
        <div className="p-4 bg-danger-500/10 border border-danger-500 rounded-xl text-danger-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6">Basic Information</h2>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Mod Title *
              </label>
              <input
                type="text"
                id="title"
                className="input"
                placeholder="e.g., Enhanced Graphics Pack"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Short Description *
              </label>
              <textarea
                id="description"
                className="input"
                rows={3}
                placeholder="Brief description for listing cards (max 200 characters)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.description.length}/200</p>
            </div>

            <div>
              <label htmlFor="longDescription" className="block text-sm font-medium text-gray-300 mb-2">
                Full Description
              </label>
              <textarea
                id="longDescription"
                className="input"
                rows={8}
                placeholder="Detailed description with features, installation instructions, etc. Markdown supported."
                value={formData.longDescription}
                onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Game Info */}
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6">Game Information</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="gameTitle" className="block text-sm font-medium text-gray-300 mb-2">
                Game Title *
              </label>
              <input
                type="text"
                id="gameTitle"
                className="input"
                placeholder="e.g., Grand Theft Auto V"
                value={formData.gameTitle}
                onChange={(e) => setFormData({ ...formData, gameTitle: e.target.value })}
                required
              />
            </div>

            <div>
              <label htmlFor="gameCategory" className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <input
                type="text"
                id="gameCategory"
                className="input"
                placeholder="e.g., Action, RPG, Simulation"
                value={formData.gameCategory}
                onChange={(e) => setFormData({ ...formData, gameCategory: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Platforms
            </label>
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => handlePlatformToggle(platform)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    formData.platform.includes(platform)
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6">Pricing</h2>
          
          <div className="space-y-6">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-dark-600 bg-dark-800"
                checked={formData.isFree}
                onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
              />
              <span className="text-gray-300">This mod is free</span>
            </label>

            {!formData.isFree && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
                    Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      id="price"
                      className="input pl-8"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      min="0.01"
                      step="0.01"
                      required={!formData.isFree}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-300 mb-2">
                    Currency
                  </label>
                  <select
                    id="currency"
                    className="input"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="NGN">NGN (₦)</option>
                  </select>
                </div>
              </div>
            )}

            <div className="p-4 bg-dark-800/50 rounded-xl">
              <p className="text-sm text-gray-400">
                <span className="text-primary-400 font-medium">Note:</span> Platform commission is{' '}
                <span className="text-white">15%</span> for free plan and <span className="text-white">10%</span> for Pro plan.
              </p>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6">Tags</h2>
          
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
              Add Tags
            </label>
            <input
              type="text"
              id="tags"
              className="input"
              placeholder="Type a tag and press Enter"
              onKeyDown={handleTagInput}
            />
            <div className="flex flex-wrap gap-2 mt-4">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="badge badge-primary flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6">Requirements</h2>
          
          <div>
            <label htmlFor="requirements" className="block text-sm font-medium text-gray-300 mb-2">
              System Requirements / Dependencies
            </label>
            <textarea
              id="requirements"
              className="input"
              rows={4}
              placeholder="List any required mods, software, or system requirements..."
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? 'Creating...' : 'Create Mod'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
