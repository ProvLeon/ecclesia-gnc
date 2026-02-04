'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserPlus, Loader2 } from 'lucide-react'
import { assignMemberToShepherd } from '@/app/actions/shepherding'

interface Shepherd {
    id: string
    firstName: string
    lastName: string
}

interface AssignmentActionsProps {
    memberId: string
    memberName: string
    shepherds: Shepherd[]
}

export function AssignmentActions({ memberId, memberName, shepherds }: AssignmentActionsProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleAssign(shepherdId: string) {
        setLoading(true)
        await assignMemberToShepherd(shepherdId, memberId)
        setLoading(false)
        router.refresh()
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={loading}>
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <UserPlus className="h-4 w-4" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-xs font-medium text-slate-500">
                    Assign to shepherd
                </div>
                {shepherds.map((shepherd) => (
                    <DropdownMenuItem
                        key={shepherd.id}
                        onClick={() => handleAssign(shepherd.id)}
                    >
                        {shepherd.firstName} {shepherd.lastName}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
