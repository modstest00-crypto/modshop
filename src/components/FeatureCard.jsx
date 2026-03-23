'use client'

export default function FeatureCard({ icon, title, description }) {
  return (
    <div className="card-glow p-8">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}
