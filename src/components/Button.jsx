'use client'

import Link from 'next/link'

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  href,
  className = '',
  ...props 
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-900'
  
  const variants = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white focus:ring-primary-500',
    secondary: 'bg-dark-700 hover:bg-dark-600 text-white focus:ring-dark-500',
    outline: 'border-2 border-primary-500 text-primary-400 hover:bg-primary-500/10 focus:ring-primary-500',
    ghost: 'text-gray-400 hover:text-white hover:bg-dark-800 focus:ring-dark-500',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
