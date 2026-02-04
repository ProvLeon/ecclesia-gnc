import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface InsightCardProps {
  title: string
  description: string
  icon?: LucideIcon
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  details?: Array<{
    label: string
    value: string | number
  }>
  className?: string
}

const variantStyles = {
  default: {
    bg: 'from-slate-50 to-transparent dark:from-slate-950/20 dark:to-transparent',
    icon: 'text-slate-600 dark:text-slate-400',
    badge: 'bg-slate-100 dark:bg-slate-800/30',
  },
  success: {
    bg: 'from-green-50 to-transparent dark:from-green-950/20 dark:to-transparent',
    icon: 'text-green-600 dark:text-green-400',
    badge: 'bg-green-100 dark:bg-green-800/30',
  },
  warning: {
    bg: 'from-amber-50 to-transparent dark:from-amber-950/20 dark:to-transparent',
    icon: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-100 dark:bg-amber-800/30',
  },
  danger: {
    bg: 'from-red-50 to-transparent dark:from-red-950/20 dark:to-transparent',
    icon: 'text-red-600 dark:text-red-400',
    badge: 'bg-red-100 dark:bg-red-800/30',
  },
  info: {
    bg: 'from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent',
    icon: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 dark:bg-blue-800/30',
  },
}

export function InsightCard({
  title,
  description,
  icon: Icon,
  variant = 'default',
  details,
  className = '',
}: InsightCardProps) {
  const styles = variantStyles[variant]

  return (
    <Card className={`border-slate-200 dark:border-slate-700 bg-gradient-to-br ${styles.bg} ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          {Icon && (
            <div className={`p-2 rounded-lg ${styles.badge}`}>
              <Icon className={`h-4 w-4 ${styles.icon}`} />
            </div>
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
        <p>{description}</p>

        {details && details.length > 0 && (
          <>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700" />
            <div className="space-y-2">
              {details.map((detail, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {detail.label}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
