'use client'

import { useState } from 'react'
import { Plus, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { assignMemberToShepherd } from '@/app/actions/shepherding'
import { useRouter } from 'next/navigation'

interface UnassignedMember {
  id: string
  firstName: string
  lastName: string
  phone?: string
  email?: string
  memberId: string
}

interface AssignMemberDialogProps {
  shepherdId: string
  unassignedMembers: UnassignedMember[]
}

export function AssignMemberDialog({
  shepherdId,
  unassignedMembers,
}: AssignMemberDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)

  const filteredMembers = unassignedMembers.filter((member) =>
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    member.memberId.toLowerCase().includes(search.toLowerCase()) ||
    (member.phone && member.phone.includes(search))
  )

  async function handleAssign(memberId: string) {
    try {
      setIsAssigning(true)
      const result = await assignMemberToShepherd(shepherdId, memberId)

      if (result.success) {
        setSearch('')
        setOpen(false)
        router.refresh()
      }
    } catch (error) {
      console.error('Error assigning member:', error)
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          Assign Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Member</DialogTitle>
          <DialogDescription>
            Select a member to assign to this shepherd
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, ID, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              disabled={isAssigning}
            />
          </div>

          {/* Members List */}
          <ScrollArea className="h-[300px] border rounded-lg p-0">
            {filteredMembers.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-slate-500 text-sm">
                  {unassignedMembers.length === 0
                    ? 'All members are already assigned'
                    : 'No members found matching your search'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {member.firstName} {member.lastName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span>{member.memberId}</span>
                        {member.phone && <span>•</span>}
                        {member.phone && <span>{member.phone}</span>}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAssign(member.id)}
                      disabled={isAssigning}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      {isAssigning ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Info */}
          {unassignedMembers.length > 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredMembers.length} of {unassignedMembers.length} available members
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
