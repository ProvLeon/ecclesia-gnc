'use client'

import { useState } from 'react'
import { createFollowUp } from '@/app/actions/follow-ups'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

interface FollowUpFormProps {
  memberId: string
  memberName: string
  onSuccess?: (followUpId: string) => void
  onCancel?: () => void
}

const FOLLOW_UP_TYPES = [
  { value: 'new_member', label: 'New Member' },
  { value: 'absence', label: 'Absence Follow-up' },
  { value: 'pastoral_care', label: 'Pastoral Care' },
  { value: 'prayer_request', label: 'Prayer Request' },
  { value: 'discipleship', label: 'Discipleship' },
  { value: 'phone_call', label: 'Phone Call' },
  { value: 'visit', label: 'Visit' },
  { value: 'prayer', label: 'Prayer' },
  { value: 'counseling', label: 'Counseling' },
  { value: 'other', label: 'Other' },
]

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

export function FollowUpForm({
  memberId,
  memberName,
  onSuccess,
  onCancel,
}: FollowUpFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    followUpType: '',
    title: '',
    description: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    priority: 'medium',
    notes: '',
  })

  const handleInputChange = (
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (!formData.followUpType.trim()) {
        throw new Error('Please select a follow-up type')
      }

      if (!formData.title.trim()) {
        throw new Error('Please enter a title')
      }

      if (!formData.scheduledDate) {
        throw new Error('Please select a scheduled date')
      }

      const result = await createFollowUp({
        memberId,
        followUpType: formData.followUpType,
        title: formData.title,
        description: formData.description,
        scheduledDate: formData.scheduledDate,
        dueDate: formData.dueDate,
        priority: formData.priority as 'low' | 'medium' | 'high' | 'urgent',
        notes: formData.notes,
      })

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          onSuccess?.(result.data?.id)
          setFormData({
            followUpType: '',
            title: '',
            description: '',
            scheduledDate: new Date().toISOString().split('T')[0],
            dueDate: '',
            priority: 'medium',
            notes: '',
          })
          setSuccess(false)
        }, 1500)
      } else {
        setError(result.error || 'Failed to create follow-up')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-900">Create Shepherd Follow-up</h3>
        <p className="text-sm text-gray-600 mt-1">
          Pastoral care for: <span className="font-medium">{memberName}</span>
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex gap-3 rounded-lg bg-red-50 p-4 border border-red-200">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex gap-3 rounded-lg bg-green-50 p-4 border border-green-200">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">Shepherd follow-up created successfully!</p>
        </div>
      )}

      {/* Follow-up Type */}
      <div className="space-y-2">
        <Label htmlFor="followUpType" className="text-sm font-medium text-gray-700">
          Follow-up Type <span className="text-red-500">*</span>
        </Label>
        <Select value={formData.followUpType} onValueChange={(value) => handleInputChange('followUpType', value)}>
          <SelectTrigger id="followUpType">
            <SelectValue placeholder="Select follow-up type" />
          </SelectTrigger>
          <SelectContent>
            {FOLLOW_UP_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium text-gray-700">
          Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g., Welcome call to new member"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium text-gray-700">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Additional details about this follow-up"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          disabled={isLoading}
          rows={3}
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="scheduledDate" className="text-sm font-medium text-gray-700">
            Scheduled Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="scheduledDate"
            type="date"
            value={formData.scheduledDate}
            onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
            Due Date
          </Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleInputChange('dueDate', e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <Label htmlFor="priority" className="text-sm font-medium text-gray-700">
          Priority
        </Label>
        <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
          <SelectTrigger id="priority">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIORITIES.map((priority) => (
              <SelectItem key={priority.value} value={priority.value}>
                {priority.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
          Shepherd Notes
        </Label>
        <Textarea
          id="notes"
          placeholder="Notes for the assigned shepherd and team"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          disabled={isLoading}
          rows={2}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Shepherd Follow-up'
          )}
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
