import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface ReportSectionProps {
  title: string
  description?: string
  icon?: LucideIcon
  children: ReactNode
  className?: string
}

export function ReportSection({
  title,
  description,
  icon: Icon,
  children,
  className = '',
}: ReportSectionProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Section Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {Icon && <Icon className="h-6 w-6 text-primary dark:text-accent" />}
          {title}
        </h2>
        {description && (
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {description}
          </p>
        )}
      </div>

      {/* Content */}
      {children}
    </div>
  )
}
