'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { PlusCircle, Loader2, Users, Check } from 'lucide-react'
import { createDepartment } from '@/app/actions/departments'

interface NewDepartmentModalProps {
    trigger?: React.ReactNode
    onSuccess?: () => void
}

export function NewDepartmentModal({ trigger, onSuccess }: NewDepartmentModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim()) return

        setLoading(true)
        await createDepartment({ name, description: description || undefined })

        setSuccess(true)
        setTimeout(() => {
            setOpen(false)
            resetForm()
            router.refresh()
            onSuccess?.()
        }, 1200)
        setLoading(false)
    }

    function resetForm() {
        setName('')
        setDescription('')
        setSuccess(false)
    }

    function handleClose() {
        setOpen(false)
        resetForm()
    }

    if (success) {
        return (
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogTrigger asChild>{trigger || <Button><PlusCircle className="h-4 w-4 mr-2" />New Department</Button>}</DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                    <div className="flex flex-col items-center py-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 animate-in zoom-in duration-300">
                            <Check className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Department Created!</h3>
                        <p className="text-sm text-slate-500 mt-1">{name}</p>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onOpenChange={(v) => v ? setOpen(true) : handleClose()}>
            <DialogTrigger asChild>
                {trigger || <Button><PlusCircle className="h-4 w-4 mr-2" />New Department</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        Create Department
                    </DialogTitle>
                    <DialogDescription>Add a new church department or ministry</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                        <Label>Department Name</Label>
                        <Input
                            placeholder="e.g., Youth Ministry"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Description (Optional)</Label>
                        <Textarea
                            placeholder="What this department does..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                        <Button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="bg-linear-to-r from-blue-600 to-indigo-600"
                        >
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Create Department
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
