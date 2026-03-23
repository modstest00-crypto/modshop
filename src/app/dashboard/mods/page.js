'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ModsPage() {
  const [mods, setMods] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [modToDelete, setModToDelete] = useState(null)

  useEffect(() => {
    fetchMods()
  }, [])

  const fetchMods = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mods/my-mods`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      const data = await res.json()
      if (data.success) {
        setMods(data.data.mods)
      }
    } catch (error) {
      console.error('Error fetching mods:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!modToDelete) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mods/${modToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      const data = await res.json()
      if (data.success) {
        setMods(mods.filter(m => m.id !== modToDelete))
        setShowDeleteModal(false)
        setModToDelete(null)
      }
    } catch (error) {
      console.error('Error deleting mod:', error)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      DRAFT: 'badge-warning',
      PENDING: 'badge-primary',
      APPROVED: 'badge-success',
      REJECTED: 'badge-danger',
      SUSPENDED: 'badge-danger',
    }
    return badges[status] || 'badge-warning'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="spinner-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Mods</h1>
          <p className="text-gray-400">Manage your mod listings</p>
        </div>
        <Link href="/dashboard/mods/new" className="btn-primary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Mod
        </Link>
      </div>

      {/* Mods Grid */}
      {mods.length > 0 ? (
        <div className="grid gap-4">
          {mods.map((mod) => (
            <div key={mod.id} className="card">
              <div className="flex items-start gap-6">
                <img
                  src={mod.images?.[0] || '/placeholder-mod.jpg'}
                  alt={mod.title}
                  className="w-32 h-32 object-cover rounded-xl"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {mod.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-1">
                        {mod.description}
                      </p>
                    </div>
                    <span className={getStatusBadge(mod.status)}>
                      {mod.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 mt-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <span>💰</span>
                      <span>{mod.isFree ? 'FREE' : `$${mod.price}`}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <span>📥</span>
                      <span>{mod.downloads || 0} downloads</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <span>🛒</span>
                      <span>{mod.sales || 0} sales</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <span>⭐</span>
                      <span>{mod.rating?.toFixed(1) || '0.0'} ({mod._count?.reviews || 0})</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <span>📦</span>
                      <span>v{mod.currentVersion}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Link
                    href={`/dashboard/mods/${mod.id}/edit`}
                    className="btn-secondary btn-sm"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/${mod.store?.slug || 'store'}/${mod.slug}`}
                    className="btn-outline btn-sm"
                    target="_blank"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => {
                      setModToDelete(mod.id)
                      setShowDeleteModal(true)
                    }}
                    className="btn-sm px-3 py-2 text-danger-400 hover:bg-danger-500/10 rounded-xl transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-white mb-2">No mods yet</h3>
          <p className="text-gray-400 mb-6">
            Create your first mod and start earning from your creations
          </p>
          <Link href="/dashboard/mods/new" className="btn-primary">
            Create Your First Mod
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-white mb-4">Delete Mod?</h3>
            <p className="text-gray-400 mb-6">
              This action cannot be undone. All sales data and reviews will be permanently deleted.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn bg-danger-500 hover:bg-danger-600 text-white flex-1"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
