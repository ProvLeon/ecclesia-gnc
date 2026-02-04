'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Users } from 'lucide-react'
import { MemberDetailsSheet } from '@/components/modals'
import { MemberActions } from './member-actions'

interface Member {
    id: string
    memberId: string
    firstName: string
    lastName: string
    middleName?: string | null
    phonePrimary: string | null
    email: string | null
    memberStatus: string | null
    photoUrl: string | null
    joinDate: string | null
}

interface MemberTableClientProps {
    members: Member[]
    search: string
    statusColors: Record<string, string>
}

export function MemberTableClient({ members, search, statusColors }: MemberTableClientProps) {
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
    const [sheetOpen, setSheetOpen] = useState(false)

    function openMemberDetails(memberId: string) {
        setSelectedMemberId(memberId)
        setSheetOpen(true)
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow className="border-slate-200 dark:border-slate-700">
                        <TableHead className="w-[300px]">Member</TableHead>
                        <TableHead>Member ID</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {members.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center">
                                <div className="text-slate-500 dark:text-slate-400">
                                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>No members found</p>
                                    <p className="text-sm">
                                        {search
                                            ? 'Try adjusting your search'
                                            : 'Add your first member to get started'}
                                    </p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        members.map((member) => (
                            <TableRow
                                key={member.id}
                                className="border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                onClick={() => openMemberDetails(member.id)}
                            >
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={member.photoUrl || ''} />
                                            <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                {member.firstName[0]}
                                                {member.lastName[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <span className="font-medium text-slate-900 dark:text-white">
                                                {member.firstName} {member.middleName ? `${member.middleName} ` : ''}{member.lastName}
                                            </span>
                                            {member.email && (
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {member.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="font-mono text-sm text-slate-600 dark:text-slate-400">
                                    {member.memberId}
                                </TableCell>
                                <TableCell className="text-slate-600 dark:text-slate-400">
                                    {member.phonePrimary || '-'}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="secondary"
                                        className={statusColors[member.memberStatus as keyof typeof statusColors]}
                                    >
                                        {member.memberStatus?.replace('_', ' ') || 'Active'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-slate-600 dark:text-slate-400">
                                    {member.joinDate
                                        ? new Date(member.joinDate).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })
                                        : '-'}
                                </TableCell>
                                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                    <MemberActions memberId={member.id} memberName={`${member.firstName} ${member.lastName}`} />
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <MemberDetailsSheet
                memberId={selectedMemberId}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
            />
        </>
    )
}
