'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { UserPlus, Search, Loader2 } from 'lucide-react'
import { recordAttendance } from '@/app/actions/attendance'
import { useRouter } from 'next/navigation'

interface Member {
    id: string
    memberId: string
    name: string
    phone: string
}

interface AttendanceRecorderProps {
    serviceId: string
    members: Member[]
    existingAttendees: string[]
}

export function AttendanceRecorder({ serviceId, members, existingAttendees }: AttendanceRecorderProps) {
    const router = useRouter()
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const filteredMembers = members.filter((m) => {
        if (existingAttendees.includes(m.id)) return false
        if (!search) return true
        const s = search.toLowerCase()
        return m.name.toLowerCase().includes(s) || m.memberId.toLowerCase().includes(s) || m.phone.includes(s)
    })

    function toggleMember(id: string) {
        setSelected((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id])
    }

    function selectAll() {
        setSelected(filteredMembers.map((m) => m.id))
    }

    async function handleSubmit() {
        if (selected.length === 0) return
        setIsSubmitting(true)
        try {
            await recordAttendance({ serviceId, memberIds: selected })
            setSelected([])
            router.refresh()
        } catch {
            // Handle error
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-slate-400" />
                        Record Attendance
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={selectAll}>Select All</Button>
                        <Button size="sm" onClick={handleSubmit} disabled={selected.length === 0 || isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Add {selected.length > 0 && `(${selected.length})`}</>}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search members..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-slate-50 dark:bg-slate-900"
                    />
                </div>

                <div className="max-h-64 overflow-y-auto border rounded-lg divide-y dark:divide-slate-700">
                    {filteredMembers.length === 0 ? (
                        <div className="p-4 text-center text-slate-500">
                            {members.length === existingAttendees.length ? 'All members already checked in' : 'No members found'}
                        </div>
                    ) : (
                        filteredMembers.slice(0, 50).map((m) => (
                            <label key={m.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
                                <Checkbox checked={selected.includes(m.id)} onCheckedChange={() => toggleMember(m.id)} />
                                <div className="flex-1">
                                    <p className="font-medium text-slate-900 dark:text-white">{m.name}</p>
                                    <p className="text-sm text-slate-500">{m.memberId} • {m.phone}</p>
                                </div>
                            </label>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
