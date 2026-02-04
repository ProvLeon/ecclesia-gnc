import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'

interface Action {
  label: string
  icon: LucideIcon
  onClick?: () => void
  href?: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  className?: string
}

interface QuickActionsBarProps {
  actions: Action[]
  className?: string
  direction?: 'row' | 'column'
}

export function QuickActionsBar({
  actions,
  className = '',
  direction = 'row',
}: QuickActionsBarProps) {
  const directionClass = direction === 'column' ? 'flex-col' : 'flex-row'

  return (
    <div className={`flex ${directionClass} gap-3 flex-wrap ${className}`}>
      {actions.map((action, idx) => {
        const Icon = action.icon
        return (
          <Button
            key={idx}
            variant={action.variant || 'outline'}
            className={`gap-2 ${action.className || ''}`}
            onClick={action.onClick}
            asChild={!!action.href}
          >
            {action.href ? (
              <a href={action.href}>
                <Icon className="h-4 w-4" />
                {action.label}
              </a>
            ) : (
              <>
                <Icon className="h-4 w-4" />
                {action.label}
              </>
            )}
          </Button>
        )
      })}
    </div>
  )
}
