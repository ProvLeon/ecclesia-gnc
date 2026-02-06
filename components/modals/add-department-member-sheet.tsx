'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { UserPlus, Search, Loader2, Check, X } from 'lucide-react'
import { addMemberToDepartment, searchMembersForDepartment } from '@/app/actions/department-members'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface AddDepartmentMemberSheetProps {
    departmentId: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AddDepartmentMemberSheet({ departmentId, open, onOpenChange }: AddDepartmentMemberSheetProps) {
    const router = useRouter()
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [searching, setSearching] = useState(false)
    const [selectedMember, setSelectedMember] = useState<string | null>(null)
    const [role, setRole] = useState<'member' | 'leader' | 'co_leader'>('member')
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)

    // Simple debounce implementation if hook doesn't exist, but let's try to assume standard usage
    useEffect(() => {
        const search = async () => {
            if (!query.trim()) {
                setResults([])
                return
            }
            setSearching(true)
            try {
                const data = await searchMembersForDepartment(departmentId, query)
                setResults(data)
            } catch (error) {
                console.error(error)
            } finally {
                setSearching(false)
            }
        }

        const timeout = setTimeout(search, 300)
        return () => clearTimeout(timeout)
    }, [query, departmentId])

    const handleAdd = async () => {
        if (!selectedMember) return

        setSubmitting(true)
        try {
            const res = await addMemberToDepartment(departmentId, selectedMember, role)
            if (res.success) {
                setSuccess(true)
                setTimeout(() => {
                    onOpenChange(false)
                    setSuccess(false)
                    setQuery('')
                    setSelectedMember(null)
                    setResults([])
                    router.refresh()
                }, 1000)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md">
                <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-blue-500" />
                        Add Member to Department
                    </SheetTitle>
                    <SheetDescription>
                        Search for a member to add them to this department.
                    </SheetDescription>
                </SheetHeader>

                {success ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center animate-in fade-in zoom-in">
                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Member Added!</h3>
                    </div>
                ) : (
                    <div className="space-y-6 px-4">
                        <div className="space-y-2">
                            <Label>Search Member</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search by name or email..."
                                    className="pl-9"
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value)
                                        setSelectedMember(null)
                                    }}
                                />
                                {searching && (
                                    <div className="absolute right-3 top-2.5">
                                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Search Results */}
                        {results.length > 0 && !selectedMember && (
                            <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
                                {results.map((member) => (
                                    <button
                                        key={member.id}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                                        onClick={() => {
                                            setSelectedMember(member.id)
                                            setQuery(`${member.firstName} ${member.lastName}`)
                                            setResults([])
                                        }}
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={member.photoUrl} />
                                            <AvatarFallback>{member.firstName[0]}{member.lastName[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm">{member.firstName} {member.lastName}</p>
                                            <p className="text-xs text-slate-500">{member.email}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* No results state */}
                        {query.length > 2 && results.length === 0 && !searching && !selectedMember && (
                            <p className="text-sm text-slate-500 text-center py-4">No members found matching "{query}"</p>
                        )}


                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={role} onValueChange={(v: any) => setRole(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="member">Member</SelectItem>
                                    <SelectItem value="co_leader">Co-Leader</SelectItem>
                                    <SelectItem value="leader">Leader</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAdd}
                                disabled={!selectedMember || submitting}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Add Member
                            </Button>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
