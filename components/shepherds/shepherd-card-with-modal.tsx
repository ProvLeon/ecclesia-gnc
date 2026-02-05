'use client'

import { useState } from 'react'
import { Phone, Mail, ChevronRight } from 'lucide-react'
import { ShepherdAssignmentsModal } from '@/components/modals/shepherd-assignments-modal'
import { format } from 'date-fns'
import { Button } from '../ui/button'

interface ShepherdCardWithModalProps {
  id: string
  firstName: string
  lastName: string
  email?: string
  phonePrimary?: string
  assignedDate: string
  assignmentCount: number
  assignments: Array<{
    id: string
    memberId: string
    memberName: string
    memberEmail?: string
    memberPhone?: string
    assignedDate: string
    status: string
  }>
}

export function ShepherdCardWithModal({
  id,
  firstName,
  lastName,
  email,
  phonePrimary,
  assignedDate,
  assignmentCount,
  assignments,
}: ShepherdCardWithModalProps) {
  const [open, setOpen] = useState(false)
  const shepherdName = `${firstName} ${lastName}`

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setOpen(true)}
        className="py-4 px-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group flex items-center justify-between gap-4 w-full text-left shadow-none hover:shadow-none h-auto"
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 dark:text-white truncate">
            {shepherdName}
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
            {phonePrimary && (
              <a
                href={`tel:${phonePrimary}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:text-primary dark:hover:text-accent flex items-center gap-1"
              >
                <Phone className="h-3 w-3" />
                {phonePrimary}
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:text-primary dark:hover:text-accent flex items-center gap-1"
              >
                <Mail className="h-3 w-3" />
                {email}
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 flex-shrink-0">
          <div className="text-right">
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {assignmentCount}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">members</p>
          </div>

          <div className="text-right">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Since{' '}
              {format(new Date(assignedDate), 'MMM yy')}
            </p>
          </div>

          <ChevronRight className="h-4 w-4 text-primary dark:text-accent opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </div>
      </Button>

      <ShepherdAssignmentsModal
        open={open}
        onOpenChange={setOpen}
        shepherdName={shepherdName}
        assignments={assignments}
        assignmentCount={assignmentCount}
      />
    </>
  )
}
