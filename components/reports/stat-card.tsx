import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  variant?: 'primary' | 'success' | 'accent' | 'warning' | 'info' | 'neutral'
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
  }
}

const variantStyles = {
  primary: {
    bg: 'from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20',
    icon: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-200 dark:bg-blue-800/50',
  },
  success: {
    bg: 'from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/20',
    icon: 'text-green-600 dark:text-green-400',
    badge: 'bg-green-200 dark:bg-green-800/50',
  },
  accent: {
    bg: 'from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/20',
    icon: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-200 dark:bg-amber-800/50',
  },
  warning: {
    bg: 'from-rose-50 to-rose-100/50 dark:from-rose-950/20 dark:to-rose-900/20',
    icon: 'text-rose-600 dark:text-rose-400',
    badge: 'bg-rose-200 dark:bg-rose-800/50',
  },
  info: {
    bg: 'from-cyan-50 to-cyan-100/50 dark:from-cyan-950/20 dark:to-cyan-900/20',
    icon: 'text-cyan-600 dark:text-cyan-400',
    badge: 'bg-cyan-200 dark:bg-cyan-800/50',
  },
  neutral: {
    bg: 'from-slate-50 to-slate-100/50 dark:from-slate-950/20 dark:to-slate-900/20',
    icon: 'text-slate-600 dark:text-slate-400',
    badge: 'bg-slate-200 dark:bg-slate-800/50',
  },
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  variant = 'primary',
  trend,
}: StatCardProps) {
  const styles = variantStyles[variant]

  return (
    <Card className={`border-slate-200 dark:border-slate-700 bg-gradient-to-br ${styles.bg}`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className={`text-xs font-semibold ${variant === 'neutral' ? 'text-slate-600 dark:text-slate-400' : `${styles.icon} opacity-75`} uppercase tracking-wider`}>
              {title}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {value}
              </p>
              {trend && (
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trend.direction === 'up'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : trend.direction === 'down'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      : 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300'
                  }`}>
                  {trend.direction === 'up' && '↑'}
                  {trend.direction === 'down' && '↓'}
                  {Math.abs(trend.value)}%
                </div>
              )}
            </div>
            {description && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                {description}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${styles.badge}`}>
            <Icon className={`h-6 w-6 ${styles.icon}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
