'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { MemberFormSheet } from '@/components/modals/member-form-sheet'

interface MemberEditTriggerProps {
    memberId: string
}

export function MemberEditTrigger({ memberId }: MemberEditTriggerProps) {
    const [open, setOpen] = useState(false)

    return (
        <MemberFormSheet
            memberId={memberId}
            open={open}
            onOpenChange={setOpen}
            trigger={
                <Button className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                    <Pencil className="h-3.5 w-3.5 mr-2" />
                    Edit
                </Button>
            }
        />
    )
}
