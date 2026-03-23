'use client'

import Link from 'next/link'

export default function PricingCard({ tier, price, period, description, features, cta, href, featured }) {
  return (
    <div className={`card relative ${featured ? 'border-primary-500 glow-primary' : ''}`}>
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="badge badge-accent">Most Popular</span>
        </div>
      )}
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-white mb-2">{tier}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold gradient-text">{price}</span>
          {period && <span className="text-gray-400">/{period}</span>}
        </div>
        <p className="text-gray-400 text-sm mt-2">{description}</p>
      </div>
      <ul className="space-y-4 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-gray-300">
            <svg className="w-5 h-5 text-success-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <Link href={href} className={featured ? 'btn-primary w-full' : 'btn-secondary w-full'}>
        {cta}
      </Link>
    </div>
  )
}
