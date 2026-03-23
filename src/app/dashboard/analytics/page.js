'use client'

import { useState, useEffect } from 'react'

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null)
  const [revenue, setRevenue] = useState(null)
  const [period, setPeriod] = useState(30)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token')
      const [analyticsRes, revenueRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/store?period=${period}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/revenue?period=${period}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ])

      const analyticsData = await analyticsRes.json()
      const revenueData = await revenueRes.json()

      if (analyticsData.success) setAnalytics(analyticsData.data)
      if (revenueData.success) setRevenue(revenueData.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-gray-400">Track your store performance</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setPeriod(days)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                period === days
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
              }`}
            >
              {days}D
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Views"
          value={analytics?.overview?.totalViews || 0}
          icon="👁️"
        />
        <StatCard
          label="Unique Visitors"
          value={analytics?.overview?.totalVisitors || 0}
          icon="👥"
        />
        <StatCard
          label="Total Sales"
          value={analytics?.overview?.totalSales || 0}
          icon="🛒"
        />
        <StatCard
          label="Total Revenue"
          value={`$${analytics?.overview?.totalRevenue?.toFixed(2) || '0.00'}`}
          icon="💰"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart Placeholder */}
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6">Revenue Trend</h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {revenue?.dailyRevenue?.slice(-14).map((day, i) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t"
                  style={{
                    height: `${Math.max((day.gross / (Math.max(...revenue.dailyRevenue.map(d => d.gross)) || 1)) * 200, 4)}px`
                  }}
                />
                <span className="text-xs text-gray-500">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Chart Placeholder */}
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6">Sales Trend</h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {analytics?.trends?.slice(-14).map((day, i) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-accent-600 to-accent-400 rounded-t"
                  style={{
                    height: `${Math.max((day.sales / (Math.max(...analytics.trends.map(d => d.sales)) || 1)) * 200, 4)}px`
                  }}
                />
                <span className="text-xs text-gray-500">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Mods */}
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6">Top Performing Mods</h2>
          <div className="space-y-4">
            {analytics?.topMods?.slice(0, 5).map((mod, index) => (
              <div key={mod.id} className="flex items-center gap-4">
                <span className="text-lg font-bold text-gray-600 w-6">#{index + 1}</span>
                <img
                  src={mod.images?.[0] || '/placeholder-mod.jpg'}
                  alt={mod.title}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{mod.title}</p>
                  <p className="text-sm text-gray-400">{mod.sales} sales</p>
                </div>
                <div className="text-right">
                  <p className="text-primary-400 font-semibold">${mod.revenue?.toFixed(2)}</p>
                  <p className="text-sm text-gray-400">{mod.downloads} downloads</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6">Recent Transactions</h2>
          <div className="space-y-4">
            {revenue?.dailyRevenue && revenue.dailyRevenue.length > 0 ? (
              Object.entries(
                revenue.dailyRevenue.reduce((acc, day) => {
                  acc.gross = (acc.gross || 0) + day.gross
                  acc.fees = (acc.fees || 0) + day.fees
                  acc.net = (acc.net || 0) + day.net
                  return acc
                }, {})
              ).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-2 border-b border-dark-700">
                  <span className="text-gray-400 capitalize">{key}</span>
                  <span className="text-white font-medium">${value?.toFixed(2)}</span>
                </div>
              ))
            ) : analytics?.recentSales?.slice(0, 5).map((sale) => (
              <div key={sale.id} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-success-500/20 rounded-full flex items-center justify-center">
                  <span className="text-success-400">$</span>
                </div>
                <div className="flex-1">
                  <p className="text-white">{sale.mod?.title}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(sale.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-success-400 font-medium">+${sale.amount}</span>
              </div>
            ))}
            {(!revenue?.dailyRevenue?.length && !analytics?.recentSales?.length) && (
              <p className="text-gray-400 text-center py-4">No transactions yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      {revenue && (
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6">Revenue Breakdown</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-dark-800/50 rounded-xl">
              <p className="text-gray-400 text-sm mb-2">Gross Revenue</p>
              <p className="text-3xl font-bold text-white">${revenue.totals?.gross?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="text-center p-6 bg-dark-800/50 rounded-xl">
              <p className="text-gray-400 text-sm mb-2">Platform Fees</p>
              <p className="text-3xl font-bold text-danger-400">-${revenue.totals?.fees?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="text-center p-6 bg-dark-800/50 rounded-xl">
              <p className="text-gray-400 text-sm mb-2">Net Earnings</p>
              <p className="text-3xl font-bold text-success-400">${revenue.totals?.net?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon }) {
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  )
}
