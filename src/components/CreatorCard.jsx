'use client'

import Link from 'next/link'

export default function CreatorCard({ creator }) {
  return (
    <Link href={`/creator/${creator.username}`} className="card-glow flex items-center gap-4 p-6">
      <img 
        src={creator.avatar || '/default-avatar.png'} 
        alt={creator.displayName}
        className="avatar-lg"
      />
      <div className="flex-1">
        <h3 className="font-semibold text-white">{creator.displayName}</h3>
        <p className="text-gray-400 text-sm">@{creator.username}</p>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          <span>{creator._count?.mods || 0} mods</span>
          <span>•</span>
          <span className="text-primary-400">${creator.store?.totalRevenue || 0} earned</span>
        </div>
      </div>
    </Link>
  )
}
