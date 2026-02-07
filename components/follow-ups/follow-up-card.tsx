'use client'

import { FollowUp } from '@/lib/db/schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Calendar, MapPin, AlertCircle, Clock, CheckCircle2, type LucideIcon } from 'lucide-react'
import { format } from 'date-fns'

interface FollowUpCardProps {
  followUp: Partial<FollowUp> & {
    memberName?: string
    memberPhone?: string
    shepherdName?: string
  }
  onComplete?: (id: string) => void
  onEdit?: (id: string) => void
  onView?: (id: string) => void
}

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: LucideIcon }> = {
  pending: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock },
  assigned: { bg: 'bg-blue-100', text: 'text-blue-800', icon: AlertCircle },
  in_progress: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
  completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle },
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}

const OUTCOME_LABELS: Record<string, string> = {
  contacted: 'Successfully Contacted',
  not_home: 'Not Home',
  left_message: 'Left Message',
  promised_action: 'Promised Action',
  resolved: 'Issue Resolved',
  escalated: 'Escalated',
  no_contact: 'Unable to Contact',
}

export function FollowUpCard({
  followUp,
  onComplete,
  onEdit,
  onView,
}: FollowUpCardProps) {
  const statusInfo = STATUS_COLORS[followUp.status || 'pending']
  const StatusIcon = statusInfo?.icon

  const isOverdue =
    followUp.dueDate && new Date(followUp.dueDate) < new Date() && followUp.status !== 'completed'

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      {/* Header with Title and Status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate text-sm">{followUp.title}</h4>
          <p className="text-sm text-gray-600 mt-0.5">{followUp.memberName}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isOverdue && (
            <Badge variant="destructive" className="text-xs whitespace-nowrap">
              Overdue
            </Badge>
          )}
          <Badge className={`${statusInfo?.bg} ${statusInfo?.text} text-xs whitespace-nowrap`}>
            {followUp.status === 'in_progress' ? 'In Progress' : followUp.status?.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Type and Priority */}
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="outline" className="text-xs">
          {followUp.followUpType?.replace('_', ' ')}
        </Badge>
        <Badge className={`${PRIORITY_COLORS[followUp.priority || 'medium']} text-xs`}>
          {((followUp.priority || 'medium').charAt(0).toUpperCase() + (followUp.priority || 'medium').slice(1))}
        </Badge>
      </div>

      {/* Dates */}
      <div className="space-y-2 mb-3 text-sm">
        {followUp.scheduledDate && (
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Scheduled: {format(new Date(followUp.scheduledDate), 'MMM d, yyyy')}</span>
          </div>
        )}
        {followUp.dueDate && (
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
              Due: {format(new Date(followUp.dueDate), 'MMM d, yyyy')}
            </span>
          </div>
        )}
      </div>

      {/* Outcome (if completed) */}
      {followUp.status === 'completed' && followUp.outcome && (
        <div className="mb-3 p-2 bg-green-50 rounded border border-green-200">
          <p className="text-xs font-medium text-green-800">
            {OUTCOME_LABELS[followUp.outcome] || followUp.outcome}
          </p>
        </div>
      )}

      {/* Contact Info */}
      {followUp.memberPhone && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <MapPin className="h-4 w-4" />
          <span>{followUp.memberPhone}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t">
        {followUp.status !== 'completed' && onComplete && (
          <Button
            size="sm"
            variant="default"
            onClick={() => onComplete(followUp.id || '')}
            className="flex-1 text-xs h-8"
          >
            Complete
          </Button>
        )}
        {onView && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView(followUp.id || '')}
            className="flex-1 text-xs h-8"
          >
            View
          </Button>
        )}
      </div>
    </Card>
  )
}
