'use client'

import { aria } from '@/lib/accessibility'

/**
 * Skip Link Component
 *
 * Provides keyboard users with a way to skip to main content
 * without tabbing through navigation. Hidden by default but
 * visible on focus.
 *
 * WCAG 2.1 Level A: 2.4.1 Bypass Blocks
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only fixed top-0 left-0 z-50 px-4 py-2 bg-blue-600 text-white font-semibold rounded-b-md focus:outline-none"
      onClick={(e) => {
        e.preventDefault()
        const mainContent = document.getElementById('main-content')
        if (mainContent) {
          mainContent.focus()
          mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }}
    >
      Skip to main content
    </a>
  )
}

export default SkipLink
