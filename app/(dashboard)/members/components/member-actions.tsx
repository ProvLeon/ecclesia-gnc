'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react'
import { deleteMember } from '@/app/actions/members'

interface MemberActionsProps {
    memberId: string
    memberName: string
    onEdit?: () => void
}

export function MemberActions({ memberId, memberName, onEdit }: MemberActionsProps) {
    const router = useRouter()
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const result = await deleteMember(memberId)
            if (result) {
                setShowDeleteDialog(false)
                router.refresh()
            } else {
                alert('Failed to delete member')
            }
        } catch (error) {
            console.error(error)
            alert('An error occurred')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4 text-slate-500" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link href={`/members/${memberId}`} className="flex items-center cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => onEdit?.()}
                        className="cursor-pointer"
                    >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-red-600 focus:text-red-600 cursor-pointer"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Deactivate
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Deactivate Member</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to deactivate <strong>{memberName}</strong>?
                            This member will be marked as inactive and hidden from active lists.
                            This action can be undone by an administrator.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deactivating...' : 'Deactivate'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
