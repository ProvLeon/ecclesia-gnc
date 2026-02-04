'use client'

import React from 'react'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-slate-200 dark:bg-slate-700'

  const variantClasses = {
    text: 'h-4 w-full rounded',
    circular: 'h-10 w-10 rounded-full',
    rectangular: 'h-12 w-full rounded-lg',
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      aria-busy="true"
      aria-label="Loading"
    />
  )
}

interface SkeletonTextProps {
  lines?: number
  className?: string
}

export function SkeletonText({ lines = 3, className = '' }: SkeletonTextProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={i === lines - 1 ? 'w-4/5' : 'w-full'}
        />
      ))}
    </div>
  )
}

interface SkeletonCardProps {
  count?: number
  className?: string
}

export function SkeletonCard({ count = 1, className = '' }: SkeletonCardProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3"
        >
          <Skeleton variant="text" className="w-1/3" />
          <SkeletonText lines={2} />
        </div>
      ))}
    </div>
  )
}

interface SkeletonTableProps {
  rows?: number
  columns?: number
  className?: string
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  className = '',
}: SkeletonTableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={`header-${i}`} className="p-3">
                <Skeleton variant="text" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowI) => (
            <tr
              key={`row-${rowI}`}
              className="border-b border-slate-200 dark:border-slate-700"
            >
              {Array.from({ length: columns }).map((_, colI) => (
                <td key={`cell-${rowI}-${colI}`} className="p-3">
                  <Skeleton variant="text" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface SkeletonStatProps {
  count?: number
  className?: string
}

export function SkeletonStat({ count = 4, className = '' }: SkeletonStatProps) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${count} gap-4 ${className}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="border border-slate-200 dark:border-slate-700 rounded-lg p-4"
        >
          <Skeleton variant="text" className="w-1/2 mb-3" />
          <Skeleton variant="text" className="h-8 w-2/3" />
        </div>
      ))}
    </div>
  )
}

interface SkeletonAvatarProps {
  count?: number
  className?: string
}

export function SkeletonAvatar({ count = 5, className = '' }: SkeletonAvatarProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="circular" />
      ))}
    </div>
  )
}

interface SkeletonListProps {
  items?: number
  className?: string
}

export function SkeletonList({ items = 8, className = '' }: SkeletonListProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg"
        >
          <Skeleton variant="circular" className="h-8 w-8 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <SkeletonText lines={2} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default Skeleton
