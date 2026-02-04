'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PlusCircle, Loader2, Heart, Search, User } from 'lucide-react'
import { createFollowUp, getMembersForFollowUp } from '@/app/actions/shepherding'

const FOLLOW_UP_TYPES = [
  { value: 'visit', label: '🏠 Home Visit' },
  { value: 'phone_call', label: '📞 Phone Call' },
  { value: 'counseling', label: '💬 Counseling' },
  { value: 'pastoral_care', label: '🏥 Pastoral Care' },
  { value: 'prayer', label: '🙏 Prayer Meeting' },
  { value: 'discipleship', label: '📖 Discipleship' },
]

interface NewFollowUpModalProps {
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function NewFollowUpModal({ trigger, onSuccess }: NewFollowUpModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [members, setMembers] = useState<{ id: string; name: string; memberId: string; phone: string }[]>([])
  const [search, setSearch] = useState('')
  const [selectedMember, setSelectedMember] = useState<typeof members[0] | null>(null)
  const [type, setType] = useState('visit')
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (open) {
      getMembersForFollowUp().then(setMembers)
    }
  }, [open])

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.memberId.toLowerCase().includes(search.toLowerCase())
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedMember) return

    setLoading(true)
    await createFollowUp({
      memberId: selectedMember.id,
      scheduledDate,
      type,
      notes: notes || undefined,
    })

    setOpen(false)
    setSelectedMember(null)
    setSearch('')
    setNotes('')
    router.refresh()
    onSuccess?.()
    setLoading(false)
  }

  function handleClose() {
    setOpen(false)
    setSelectedMember(null)
    setSearch('')
  }

  return (
    <Dialog open={open} onOpenChange={(v) => v ? setOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Schedule Follow-up
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" />
            Schedule Follow-up
          </DialogTitle>
          <DialogDescription>
            Plan pastoral care for a member
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Member Selection */}
          {!selectedMember ? (
            <div className="space-y-2">
              <Label>Select Member</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search members..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
              <div className="max-h-40 overflow-y-auto rounded-lg border divide-y dark:divide-slate-700">
                {filteredMembers.slice(0, 10).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMember(m)}
                    className="w-full p-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-slate-900 dark:text-white truncate">{m.name}</p>
                      <p className="text-xs text-slate-500 truncate">{m.memberId} • {m.phone}</p>
                    </div>
                  </button>
                ))}
                {filteredMembers.length === 0 && search && (
                  <div className="p-4 text-center text-sm text-slate-500">
                    No members found
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Selected Member Card */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-800 flex items-center justify-center">
                    <User className="h-5 w-5 text-rose-600 dark:text-rose-300" />
                  </div>
                  <div>
                    <p className="font-medium text-rose-900 dark:text-rose-100">{selectedMember.name}</p>
                    <p className="text-xs text-rose-600 dark:text-rose-400">{selectedMember.phone}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMember(null)}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-100"
                >
                  Change
                </Button>
              </div>

              {/* Type & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FOLLOW_UP_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Purpose of visit, prayer requests..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedMember}
              className="bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Schedule
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
