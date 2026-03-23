'use client'

export default function Card({ children, className = '', glow = false, ...props }) {
  const baseClasses = 'bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl overflow-hidden'
  const glowClasses = glow ? ' card-glow' : ''
  
  return (
    <div className={`${baseClasses}${glowClasses} ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 border-b border-dark-700 ${className}`}>
      {children}
    </div>
  )
}

export function CardBody({ children, className = '' }) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 border-t border-dark-700 bg-dark-800/30 ${className}`}>
      {children}
    </div>
  )
}
