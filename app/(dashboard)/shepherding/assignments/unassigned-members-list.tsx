'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { AssignmentActions } from './assignment-actions'
import { searchUnassignedMembers } from '@/app/actions/shepherding'
import { Users, Search, Loader2 } from 'lucide-react'

interface Member {
    id: string
    firstName: string
    lastName: string
    phone: string | null
}

interface Shepherd {
    id: string
    firstName: string
    lastName: string
}

interface UnassignedMembersListProps {
    initialMembers: Member[]
    shepherds: Shepherd[]
    totalUnassigned: number
}

export function UnassignedMembersList({ initialMembers, shepherds, totalUnassigned }: UnassignedMembersListProps) {
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [members, setMembers] = useState<Member[]>(initialMembers)
    const [isLoading, setIsLoading] = useState(false)

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
        }, 300)

        return () => clearTimeout(timer)
    }, [search])

    // Fetch members when search changes
    useEffect(() => {
        const fetchMembers = async () => {
            setIsLoading(true)
            try {
                // If search is empty, we arguably should reset to initial members OR fetch fresh first page
                // To keep it simple and consistent with "search", let's always fetch if we search multiple times
                // Or if search cleared, show initial? 
                // Let's just use the server action for everything to be consistent.
                const results = await searchUnassignedMembers(debouncedSearch)
                setMembers(results)
            } catch (error) {
                console.error('Failed to search members:', error)
            } finally {
                setIsLoading(false)
            }
        }

        // Only fetch if search changed from initial or is active
        // Actually, initial render has data. 
        if (debouncedSearch !== '') {
            fetchMembers()
        } else if (debouncedSearch === '' && members !== initialMembers) {
            // Reset to initial if cleared? Or fetch fresh standard list?
            // Let's fetch fresh standard list to ensure we are up to date
            fetchMembers()
        }
    }, [debouncedSearch])

    return (
        <Card>
            <CardHeader className="border-b border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Unassigned ({totalUnassigned})
                    </CardTitle>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search unassigned members..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                    {isLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-200 dark:divide-slate-700 max-h-96 overflow-y-auto">
                {members.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">
                        {isLoading ? 'Searching...' : 'No unassigned members found'}
                    </div>
                ) : (
                    members.map((member) => (
                        <div key={member.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs">
                                        {member.firstName[0]}{member.lastName[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium">{member.firstName} {member.lastName}</p>
                                    <p className="text-xs text-slate-500">{member.phone}</p>
                                </div>
                            </div>
                            <AssignmentActions
                                memberId={member.id}
                                memberName={`${member.firstName} ${member.lastName}`}
                                shepherds={shepherds}
                            />
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}
