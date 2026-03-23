'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [recentSales, setRecentSales] = useState([])
  const [topMods, setTopMods] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      const [statsRes, analyticsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/store`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/store?period=30`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ])

      const statsData = await statsRes.json()
      const analyticsData = await analyticsRes.json()

      if (statsData.success) {
        setStats(statsData.data.store)
        setTopMods(statsData.data.store.mods?.slice(0, 5) || [])
      }

      if (analyticsData.success) {
        setRecentSales(analyticsData.data.recentSales || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="spinner-lg mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">No Store Found</h2>
        <p className="text-gray-400 mb-6">Create your store to start selling mods</p>
        <Link href="/dashboard/store/create" className="btn-primary">
          Create Store
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome back, {stats.user?.displayName || stats.name}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          label="Total Revenue"
          value={`$${stats.totalRevenue || 0}`}
          trend="+12.5%"
          trendUp={true}
          icon="💰"
        />
        <StatCard
          label="Total Sales"
          value={stats.totalSales || 0}
          trend="+8.2%"
          trendUp={true}
          icon="🛒"
        />
        <StatCard
          label="Total Mods"
          value={stats.mods?.length || 0}
          icon="📦"
        />
        <StatCard
          label="Avg Rating"
          value={(stats.mods?.reduce((acc, m) => acc + (m.rating || 0), 0) / (stats.mods?.length || 1))?.toFixed(1) || '0.0'}
          icon="⭐"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Top Mods */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Top Performing Mods</h2>
              <Link href="/dashboard/mods" className="text-sm text-primary-400 hover:text-primary-300">
                View all
              </Link>
            </div>

            {topMods.length > 0 ? (
              <div className="space-y-4">
                {topMods.map((mod, index) => (
                  <div
                    key={mod.id}
                    className="flex items-center gap-4 p-4 bg-dark-800/50 rounded-xl"
                  >
                    <span className="text-2xl font-bold text-gray-600 w-8">
                      #{index + 1}
                    </span>
                    <img
                      src={mod.images?.[0] || '/placeholder-mod.jpg'}
                      alt={mod.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">{mod.title}</h3>
                      <p className="text-sm text-gray-400">
                        {mod.sales || 0} sales • ${(mod.revenue || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-primary-400 font-semibold">
                        {mod.isFree ? 'FREE' : `$${mod.price}`}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-gray-400">
                        <span>★</span>
                        <span>{mod.rating?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No mods yet</p>
                <Link href="/dashboard/mods/new" className="text-primary-400 hover:text-primary-300 mt-2 inline-block">
                  Create your first mod
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div>
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Recent Sales</h2>
              <Link href="/dashboard/analytics" className="text-sm text-primary-400 hover:text-primary-300">
                View all
              </Link>
            </div>

            {recentSales.length > 0 ? (
              <div className="space-y-4">
                {recentSales.slice(0, 5).map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-xl"
                  >
                    <div className="w-10 h-10 bg-success-500/20 rounded-full flex items-center justify-center">
                      <span className="text-success-400">$</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {sale.mod?.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-success-400 font-medium">
                      +${sale.amount}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No sales yet</p>
                <p className="text-sm mt-1">Keep promoting your mods!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction
            icon="📦"
            label="Add New Mod"
            href="/dashboard/mods/new"
          />
          <QuickAction
            icon="📊"
            label="View Analytics"
            href="/dashboard/analytics"
          />
          <QuickAction
            icon="🏪"
            label="Edit Store"
            href="/dashboard/store"
          />
          <QuickAction
            icon="💰"
            label="Request Payout"
            href="/dashboard/payouts"
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, trend, trendUp, icon }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        {trend && (
          <span className={`text-sm font-medium ${trendUp ? 'text-success-400' : 'text-danger-400'}`}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  )
}

function QuickAction({ icon, label, href }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center p-6 bg-dark-800/50 rounded-xl hover:bg-dark-700 transition-colors group"
    >
      <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-sm font-medium text-gray-300">{label}</span>
    </Link>
  )
}
