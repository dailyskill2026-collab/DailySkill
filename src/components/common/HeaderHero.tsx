import React from 'react'
import { Link } from 'react-router-dom'

interface HeaderHeroProps {
  title: string
  subtitle?: string
  ctaLabel?: string
  ctaTo?: string
  backgroundImage?: string // URL or import
}

export default function HeaderHero({
  title,
  subtitle,
  ctaLabel = 'Start Learning',
  ctaTo = '/learn',
  backgroundImage,
}: HeaderHeroProps) {
  const bgStyle = backgroundImage
    ? { backgroundImage: `url(${backgroundImage})` }
    : { backgroundColor: 'var(--tw-gradient-from, #f5f7fa)' }

  return (
    <section
      className="relative flex flex-col items-center justify-center text-center py-12 md:py-20 bg-gradient-to-r from-background-light to-background-dark"
      style={bgStyle}
    >
      <h1 className="text-3xl md:text-5xl font-bold text-primary-light dark:text-primary-dark mb-4">
        {title}
      </h1>
      {subtitle && (
        <p className="text-lg md:text-xl text-secondary-light dark:text-secondary-dark mb-6 max-w-xl">
          {subtitle}
        </p>
      )}
      <Link
        to={ctaTo}
        className="inline-block px-6 py-3 rounded-xl gradient-brand text-white font-medium hover:opacity-90 transition-opacity"
      >
        {ctaLabel}
      </Link>
    </section>
  )
}
