import { ReactNode } from 'react'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
}

const variantStyles = {
  default: 'from-slate-500 to-slate-600',
  success: 'from-green-500 to-green-600',
  warning: 'from-amber-500 to-amber-600',
  danger: 'from-red-500 to-red-600',
  info: 'from-blue-500 to-blue-600',
}

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  variant = 'default',
  size = 'md',
  animated = false,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className={className}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <div
          className={`bg-gradient-to-r ${variantStyles[variant]} rounded-full transition-all duration-300 ${sizeStyles[size]} ${animated ? 'animate-pulse' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
