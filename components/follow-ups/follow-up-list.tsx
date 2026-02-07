'use client'

import { useCallback, useEffect, useState } from 'react'
import { FollowUp } from '@/lib/db/schema'
import { FollowUpCard } from './follow-up-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Loader2, AlertCircle } from 'lucide-react'

interface FollowUpListProps {
  followUps: Array<{
    id: string
    title: string
    status: string
    priority: string
    followUpType: string
    scheduledDate: Date | string
    dueDate?: Date | string | null
    outcome?: string | null
    memberName?: string
    memberPhone?: string
    shepherdName?: string
  }>
  isLoading?: boolean
  onComplete?: (id: string) => void
  onEdit?: (id: string) => void
  onView?: (id: string) => void
  emptyMessage?: string
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

export function FollowUpList({
  followUps,
  isLoading = false,
  onComplete,
  onEdit,
  onView,
  emptyMessage = 'No follow-ups found',
}: FollowUpListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [filteredFollowUps, setFilteredFollowUps] = useState(followUps)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filter and search follow-ups
  useEffect(() => {
    let filtered = followUps

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (fu) =>
          fu.title?.toLowerCase().includes(term) ||
          fu.memberName?.toLowerCase().includes(term) ||
          fu.memberPhone?.includes(term)
      )
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((fu) => fu.status === statusFilter)
    }

    // Priority filter
    if (priorityFilter) {
      filtered = filtered.filter((fu) => fu.priority === priorityFilter)
    }

    setFilteredFollowUps(filtered)
    setCurrentPage(1)
  }, [followUps, searchTerm, statusFilter, priorityFilter])

  // Pagination
  const totalPages = Math.ceil(filteredFollowUps.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const paginatedFollowUps = filteredFollowUps.slice(startIdx, startIdx + itemsPerPage)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by title, member, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIORITY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="text-sm text-gray-600 flex items-center">
          {filteredFollowUps.length} follow-up{filteredFollowUps.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* List */}
      {paginatedFollowUps.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedFollowUps.map((followUp) => (
              <FollowUpCard
                key={followUp.id}
                followUp={{
                  ...followUp,
                  status: (followUp.status as 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled') || 'pending',
                  priority: (followUp.priority as 'low' | 'medium' | 'high' | 'urgent') || 'medium',
                  outcome: (followUp.outcome as 'contacted' | 'not_home' | 'left_message' | 'promised_action' | 'resolved' | 'escalated' | 'no_contact' | null | undefined) || null,
                } as Partial<FollowUp> & {
                  memberName?: string
                  memberPhone?: string
                  shepherdName?: string
                }}
                onComplete={onComplete}
                onEdit={onEdit}
                onView={onView}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-gray-300 mb-3" />
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      )}
    </div>
  )
}
