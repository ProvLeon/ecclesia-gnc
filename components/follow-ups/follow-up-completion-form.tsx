'use client'

import { useState } from 'react'
import { completeFollowUp } from '@/app/actions/follow-ups'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

interface FollowUpCompletionFormProps {
  followUpId: string
  followUpTitle: string
  memberName: string
  onSuccess?: () => void
  onCancel?: () => void
}

const OUTCOMES = [
  { value: 'contacted', label: 'Successfully Contacted' },
  { value: 'not_home', label: 'Not Home' },
  { value: 'left_message', label: 'Left Message' },
  { value: 'promised_action', label: 'Promised Action' },
  { value: 'resolved', label: 'Issue Resolved' },
  { value: 'escalated', label: 'Escalated to Pastor' },
  { value: 'no_contact', label: 'Unable to Contact' },
]

export function FollowUpCompletionForm({
  followUpId,
  followUpTitle,
  memberName,
  onSuccess,
  onCancel,
}: FollowUpCompletionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    outcome: '',
    outcomeNotes: '',
    notes: '',
  })

  const handleInputChange = (field: string, value: string) => {
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
      if (!formData.outcome.trim()) {
        throw new Error('Please select an outcome')
      }

      if (!formData.outcomeNotes.trim()) {
        throw new Error('Please provide outcome notes')
      }

      const result = await completeFollowUp(followUpId, {
        outcome: formData.outcome as 'contacted' | 'not_home' | 'left_message' | 'promised_action' | 'resolved' | 'escalated' | 'no_contact',
        outcomeNotes: formData.outcomeNotes,
        notes: formData.notes,
      })

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          onSuccess?.()
          setFormData({
            outcome: '',
            outcomeNotes: '',
            notes: '',
          })
          setSuccess(false)
        }, 1500)
      } else {
        setError(result.error || 'Failed to complete follow-up')
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
        <h3 className="text-lg font-semibold text-gray-900">Complete Shepherd Follow-up</h3>
        <div className="mt-2 space-y-1">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Title:</span> {followUpTitle}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Member:</span> {memberName}
          </p>
        </div>
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
          <p className="text-sm text-green-800">Shepherd follow-up completed successfully!</p>
        </div>
      )}

      {/* Outcome */}
      <div className="space-y-2">
        <Label htmlFor="outcome" className="text-sm font-medium text-gray-700">
          Outcome <span className="text-red-500">*</span>
        </Label>
        <Select value={formData.outcome} onValueChange={(value) => handleInputChange('outcome', value)}>
          <SelectTrigger id="outcome">
            <SelectValue placeholder="Select outcome" />
          </SelectTrigger>
          <SelectContent>
            {OUTCOMES.map((outcome) => (
              <SelectItem key={outcome.value} value={outcome.value}>
                {outcome.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Outcome Notes */}
      <div className="space-y-2">
        <Label htmlFor="outcomeNotes" className="text-sm font-medium text-gray-700">
          Outcome Details <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="outcomeNotes"
          placeholder="Describe what happened during the follow-up and what was discussed"
          value={formData.outcomeNotes}
          onChange={(e) => handleInputChange('outcomeNotes', e.target.value)}
          disabled={isLoading}
          rows={4}
          className="resize-none"
        />
      </div>

      {/* Additional Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
          Additional Notes
        </Label>
        <Textarea
          id="notes"
          placeholder="Follow-up actions or notes for other shepherds on the team"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          disabled={isLoading}
          rows={2}
          className="resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Completing...
            </>
          ) : (
            'Complete Shepherd Follow-up'
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
