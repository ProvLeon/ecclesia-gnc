'use client'

import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Search, User, Phone, Mail, Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface ShepherdAssignment {
  id: string
  memberId: string
  memberName: string
  memberEmail?: string
  memberPhone?: string
  assignedDate: string
  status: string
}

interface ShepherdAssignmentsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shepherdName: string
  assignments: ShepherdAssignment[]
  assignmentCount: number
}

export function ShepherdAssignmentsModal({
  open,
  onOpenChange,
  shepherdName,
  assignments,
  assignmentCount,
}: ShepherdAssignmentsModalProps) {
  const [search, setSearch] = useState('')

  const filteredAssignments = useMemo(() => {
    return assignments.filter(
      (assignment) =>
        assignment.memberName.toLowerCase().includes(search.toLowerCase()) ||
        assignment.memberPhone?.includes(search) ||
        assignment.memberEmail?.toLowerCase().includes(search.toLowerCase())
    )
  }, [search, assignments])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden rounded-xl border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
              {shepherdName}
            </DialogTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {assignmentCount} member{assignmentCount !== 1 ? 's' : ''} assigned for pastoral care
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-lg text-sm"
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filteredAssignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 mb-3">
                <User className="h-6 w-6 text-slate-400 dark:text-slate-600" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                {search ? 'No members found' : 'No assignments yet'}
              </p>
              {search && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearch('')}
                  className="mt-3 text-sm h-8"
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredAssignments.map((assignment, index) => (
                <div
                  key={assignment.id}
                  className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Avatar className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40">
                      <AvatarFallback className="font-semibold text-blue-700 dark:text-blue-300 text-sm">
                        {getInitials(assignment.memberName)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                          {assignment.memberName}
                        </h3>
                        <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">
                          #{index + 1}
                        </span>
                      </div>

                      {/* Contact Links */}
                      <div className="flex flex-wrap gap-3 text-sm">
                        {assignment.memberPhone && (
                          <a
                            href={`tel:${assignment.memberPhone}`}
                            className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                          >
                            <Phone className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                            <span>{assignment.memberPhone}</span>
                          </a>
                        )}
                        {assignment.memberEmail && (
                          <a
                            href={`mailto:${assignment.memberEmail}`}
                            className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                          >
                            <Mail className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                            <span className="truncate">{assignment.memberEmail}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Right Section - Date */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-shrink-0 whitespace-nowrap">
                      <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                      {format(new Date(assignment.assignedDate), 'MMM d')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
