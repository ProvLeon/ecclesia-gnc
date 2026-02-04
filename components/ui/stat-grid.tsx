import { ReactNode } from 'react'

interface StatGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export function StatGrid({
  children,
  columns = 4,
  className = '',
}: StatGridProps) {
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns]

  return (
    <div className={`grid ${gridColsClass} gap-4 ${className}`}>
      {children}
    </div>
  )
}
