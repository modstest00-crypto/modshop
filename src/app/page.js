'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const [featuredMods, setFeaturedMods] = useState([])
  const [topCreators, setTopCreators] = useState([])

  useEffect(() => {
    // Fetch featured mods and top creators
    fetchFeaturedMods()
    fetchTopCreators()
  }, [])

  const fetchFeaturedMods = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mods/featured`)
      const data = await res.json()
      if (data.success) {
        setFeaturedMods(data.data.mods)
      }
    } catch (error) {
      console.error('Error fetching featured mods:', error)
    }
  }

  const fetchTopCreators = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/creators?sortBy=sales&limit=6`)
      const data = await res.json()
      if (data.success) {
        setTopCreators(data.data.creators)
      }
    } catch (error) {
      console.error('Error fetching creators:', error)
    }
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow delay-1000" />
        
        {/* Content */}
        <div className="container-custom relative z-10 text-center">
          <div className="animate-slide-up">
            <span className="badge badge-primary mb-6">
              🚀 The Stripe for Mod Creators
            </span>
            
            <h1 className="text-5xl md:text-7xl font-bold font-display mb-6">
              <span className="gradient-text">Sell Your Mods</span>
              <br />
              <span className="text-white">Like a Pro</span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
              Instant storefront platform for selling game mods. Handle payments, 
              delivery, updates, and fraud protection with ease. Start earning 
              from your creations today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="btn-primary btn-lg glow-primary">
                Start Selling Free
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link href="/mods" className="btn-secondary btn-lg">
                Browse Mods
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
              <div className="stat-card">
                <div className="stat-value">$10M+</div>
                <div className="stat-label">Creator Earnings</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">50K+</div>
                <div className="stat-label">Mods Listed</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">100K+</div>
                <div className="stat-label">Happy Buyers</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">99.9%</div>
                <div className="stat-label">Uptime</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow">
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-dark-800/50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="section-title gradient-text">Why ModShop?</h2>
            <p className="section-subtitle mx-auto">
              Everything you need to turn your modding passion into profit
            </p>
          </div>
          
          <div className="grid-auto-fit">
            <FeatureCard
              icon="🏪"
              title="Instant Storefront"
              description="Set up your professional store in minutes. No coding required, just upload and sell."
            />
            <FeatureCard
              icon="💳"
              title="Split Payments"
              description="Automatic payment splitting. You get 85-90%, we take a small commission."
            />
            <FeatureCard
              icon="📦"
              title="Auto Delivery"
              description="Customers receive download links instantly after purchase. Fully automated."
            />
            <FeatureCard
              icon="📊"
              title="Analytics Dashboard"
              description="Track sales, views, and customer behavior with detailed analytics."
            />
            <FeatureCard
              icon="🔄"
              title="Version Management"
              description="Push updates to all buyers automatically. Keep your mods current."
            />
            <FeatureCard
              icon="🛡️"
              title="Fraud Protection"
              description="Advanced fraud detection and secure file delivery with signed URLs."
            />
          </div>
        </div>
      </section>

      {/* Featured Mods Section */}
      <section className="section">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="section-title text-white">Featured Mods</h2>
              <p className="section-subtitle">Hand-picked mods from top creators</p>
            </div>
            <Link href="/mods" className="btn-outline btn-sm">
              View All
            </Link>
          </div>
          
          <div className="grid-auto-fit">
            {featuredMods.length > 0 ? (
              featuredMods.map((mod) => (
                <ModCard key={mod.id} mod={mod} />
              ))
            ) : (
              // Skeleton loaders
              Array(4).fill(0).map((_, i) => (
                <ModCardSkeleton key={i} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="section bg-dark-800/50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="section-title gradient-text">Simple Pricing</h2>
            <p className="section-subtitle mx-auto">
              Start free, upgrade when you're ready to scale
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              tier="Free"
              price="$0"
              period="forever"
              description="Perfect for getting started"
              features={[
                'List up to 3 mods',
                '15% platform commission',
                'Basic analytics',
                'Community support',
                'Secure file hosting',
              ]}
              cta="Start Free"
              href="/auth/register"
            />
            
            <PricingCard
              tier="Pro"
              price="$19"
              period="per month"
              description="For serious creators"
              features={[
                'Unlimited mods',
                '10% platform commission',
                'Advanced analytics',
                'Priority support',
                'Custom storefront',
                'API access',
                'Early access to features',
              ]}
              cta="Go Pro"
              href="/auth/register?plan=pro"
              featured
            />
            
            <PricingCard
              tier="Enterprise"
              price="Custom"
              period=""
              description="For modding teams & studios"
              features={[
                'Everything in Pro',
                'Custom commission rates',
                'Dedicated support',
                'SLA guarantee',
                'Custom integrations',
                'Team accounts',
                'White-label options',
              ]}
              cta="Contact Sales"
              href="/contact"
            />
          </div>
        </div>
      </section>

      {/* Top Creators Section */}
      <section className="section">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="section-title text-white">Top Creators</h2>
              <p className="section-subtitle">Join the most successful mod creators</p>
            </div>
            <Link href="/creators" className="btn-outline btn-sm">
              View All
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topCreators.length > 0 ? (
              topCreators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
              ))
            ) : (
              Array(3).fill(0).map((_, i) => (
                <CreatorCardSkeleton key={i} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/50 to-accent-900/50" />
        <div className="container-custom relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">
            Ready to Start <span className="gradient-text">Earning?</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Join thousands of creators who are already making money from their mods.
            Set up your store in minutes.
          </p>
          <Link href="/auth/register" className="btn-primary btn-lg glow-primary">
            Create Your Store - It's Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-700 py-12">
        <div className="container-custom">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold gradient-text mb-4">ModShop</h3>
              <p className="text-gray-400 text-sm">
                The Stripe for Mod Creators. Building the financial layer for the 
                mod creator economy.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/mods" className="hover:text-primary-400">Browse Mods</Link></li>
                <li><Link href="/creators" className="hover:text-primary-400">Top Creators</Link></li>
                <li><Link href="/pricing" className="hover:text-primary-400">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-primary-400">Documentation</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/about" className="hover:text-primary-400">About</Link></li>
                <li><Link href="/blog" className="hover:text-primary-400">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-primary-400">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-primary-400">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/terms" className="hover:text-primary-400">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-primary-400">Privacy Policy</Link></li>
                <li><Link href="/dmca" className="hover:text-primary-400">DMCA</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-dark-700 mt-12 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} ModShop. All rights reserved.</p>
            <p className="mt-2">Built by a solo developer who is both a gamer and a creator at heart.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="card-glow p-8">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}

function ModCard({ mod }) {
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

function ModCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="h-48 skeleton" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 skeleton" />
        <div className="h-4 w-full skeleton" />
        <div className="h-4 w-2/3 skeleton" />
        <div className="flex justify-between">
          <div className="h-6 w-16 skeleton" />
          <div className="h-4 w-12 skeleton" />
        </div>
      </div>
    </div>
  )
}

function CreatorCard({ creator }) {
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

function CreatorCardSkeleton() {
  return (
    <div className="card flex items-center gap-4 p-6">
      <div className="avatar-lg skeleton" />
      <div className="flex-1 space-y-2">
        <div className="h-5 w-32 skeleton" />
        <div className="h-4 w-24 skeleton" />
        <div className="h-3 w-40 skeleton" />
      </div>
    </div>
  )
}

function PricingCard({ tier, price, period, description, features, cta, href, featured }) {
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
