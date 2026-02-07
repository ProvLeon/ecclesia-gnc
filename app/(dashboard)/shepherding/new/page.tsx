'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, Loader2, Heart, Search, Home, Phone, MessageSquare, Hospital, Users } from 'lucide-react'
import { createFollowUp, getMembersForFollowUp } from '@/app/actions/shepherding'

const schema = z.object({
  memberId: z.string().min(1, 'Select a member'),
  scheduledDate: z.string().min(1, 'Date is required'),
  type: z.string().min(1, 'Type is required'),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function NewFollowUpPage() {
  const router = useRouter()
  const [members, setMembers] = useState<{ id: string; name: string; memberId: string; phone: string | null }[]>([])
  const [search, setSearch] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      scheduledDate: new Date().toISOString().split('T')[0],
      type: 'visit',
    },
  })

  const selectedMemberId = watch('memberId')

  useEffect(() => {
    getMembersForFollowUp().then(setMembers)
  }, [])

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.memberId.toLowerCase().includes(search.toLowerCase())
  )

  async function onSubmit(data: FormData) {
    setIsSubmitting(true)
    try {
      await createFollowUp(data)
      router.push('/shepherding')
    } catch {
      setError('Failed to create follow-up')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedMember = members.find((m) => m.id === selectedMemberId)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/shepherding">
          <Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Schedule Follow-up</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Plan a pastoral visit or call</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Member Selection */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-900/30">
                <Heart className="h-5 w-5" />
              </div>
              Select Member
            </CardTitle>
            <CardDescription>Select a member for shepherd follow-up</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search members..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-slate-50 dark:bg-slate-900" />
            </div>

            {selectedMember && (
              <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800">
                <p className="font-medium text-rose-900 dark:text-rose-100">{selectedMember.name}</p>
                <p className="text-sm text-rose-600 dark:text-rose-400">{selectedMember.memberId} • {selectedMember.phone}</p>
              </div>
            )}

            <div className="max-h-48 overflow-y-auto border rounded-lg divide-y dark:divide-slate-700">
              {filteredMembers.slice(0, 20).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setValue('memberId', m.id)}
                  className={`w-full p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${selectedMemberId === m.id ? 'bg-rose-50 dark:bg-rose-900/20' : ''
                    }`}
                >
                  <p className="font-medium text-slate-900 dark:text-white">{m.name}</p>
                  <p className="text-sm text-slate-500">{m.memberId} • {m.phone}</p>
                </button>
              ))}
            </div>
            {errors.memberId && <p className="text-sm text-red-500">{errors.memberId.message}</p>}
          </CardContent>
        </Card>

        {/* Details */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
          <CardHeader>
            <CardTitle>Follow-up Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select defaultValue="visit" onValueChange={(v) => setValue('type', v)}>
                <SelectTrigger className="bg-slate-50 dark:bg-slate-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visit"><span className="flex items-center gap-2"><Home className="h-4 w-4" /> Home Visit</span></SelectItem>
                  <SelectItem value="call"><span className="flex items-center gap-2"><Phone className="h-4 w-4" /> Phone Call</span></SelectItem>
                  <SelectItem value="counseling"><span className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Counseling</span></SelectItem>
                  <SelectItem value="hospital"><span className="flex items-center gap-2"><Hospital className="h-4 w-4" /> Hospital Visit</span></SelectItem>
                  <SelectItem value="prayer"><span className="flex items-center gap-2"><Users className="h-4 w-4" /> Prayer Meeting</span></SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Scheduled Date *</Label>
              <Input id="scheduledDate" type="date" {...register('scheduledDate')} className="bg-slate-50 dark:bg-slate-900" />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" {...register('notes')} placeholder="Purpose of visit, prayer requests, etc." className="bg-slate-50 dark:bg-slate-900" rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/shepherding">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={isSubmitting} className="bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-lg shadow-rose-500/25">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />Schedule</>}
          </Button>
        </div>
      </form>
    </div>
  )
}
