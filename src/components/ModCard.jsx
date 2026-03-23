'use client'

import Link from 'next/link'

export default function ModCard({ mod }) {
  return (
    <Link href={`/${mod.store?.slug}/${mod.slug}`} className="mod-card group">
      <div className="mod-card-image">
        <img src={mod.images?.[0] || '/placeholder-mod.jpg'} alt={mod.title} />
        <div className="mod-card-overlay" />
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
          {mod.title}
        </h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{mod.description}</p>
        <div className="flex justify-between items-center">
          <span className={mod.isFree ? 'price-free' : 'price-paid'}>
            {mod.isFree ? 'FREE' : `$${mod.price}`}
          </span>
          <div className="rating">
            <span className="rating-star">★</span>
            <span className="text-gray-400 text-sm ml-1">{mod.rating?.toFixed(1) || '0.0'}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
