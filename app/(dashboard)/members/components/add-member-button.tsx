'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MemberFormSheet } from '@/components/modals'

export function AddMemberButton() {
    const [open, setOpen] = useState(false)

    return (
        <>
            <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Member
            </Button>
            <MemberFormSheet open={open} onOpenChange={setOpen} />
        </>
    )
}
