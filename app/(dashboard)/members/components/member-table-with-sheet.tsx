'use client'

import { useState } from 'react'
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
  phonePrimary: string | null
  email: string | null
  memberStatus: string | null
  photoUrl: string | null
}

interface MemberTableWithSheetProps {
  members: Member[]
  search: string
  statusColors: Record<string, string>
}

export function MemberTableWithSheet({ members, search, statusColors }: MemberTableWithSheetProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  function openMemberSheet(memberId: string) {
    setSelectedMemberId(memberId)
    setSheetOpen(true)
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="border-slate-200 dark:border-slate-700">
            <TableHead>Member</TableHead>
            <TableHead>Member ID</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
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
                className="border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                onClick={() => openMemberSheet(member.id)}
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
                        {member.firstName} {member.lastName}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm text-slate-500">
                  {member.memberId}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {member.phonePrimary || '-'}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400 max-w-40 truncate">
                  {member.email || '-'}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={statusColors[member.memberStatus || 'active']}
                  >
                    {member.memberStatus?.replace('_', ' ') || 'Active'}
                  </Badge>
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
