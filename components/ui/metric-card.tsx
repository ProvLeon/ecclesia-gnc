import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
  }
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

const variantStyles = {
  default: {
    bg: 'bg-slate-50 dark:bg-slate-900/20',
    icon: 'text-slate-600 dark:text-slate-400',
    badge: 'bg-slate-200 dark:bg-slate-800/50',
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-950/20',
    icon: 'text-green-600 dark:text-green-400',
    badge: 'bg-green-200 dark:bg-green-800/50',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    icon: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-200 dark:bg-amber-800/50',
  },
  danger: {
    bg: 'bg-red-50 dark:bg-red-950/20',
    icon: 'text-red-600 dark:text-red-400',
    badge: 'bg-red-200 dark:bg-red-800/50',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    icon: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-200 dark:bg-blue-800/50',
  },
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className = '',
}: MetricCardProps) {
  const styles = variantStyles[variant]

  return (
    <Card className={`border-slate-200 dark:border-slate-700 ${styles.bg} ${className}`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              {title}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {value}
              </p>
              {trend && (
                <div
                  className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trend.direction === 'up'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : trend.direction === 'down'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        : 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300'
                    }`}
                >
                  {trend.direction === 'up' && '↑'}
                  {trend.direction === 'down' && '↓'}
                  {Math.abs(trend.value)}%
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                {subtitle}
              </p>
            )}
          </div>
          {Icon && (
            <div className={`p-3 rounded-lg ${styles.badge}`}>
              <Icon className={`h-6 w-6 ${styles.icon}`} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
