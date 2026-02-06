'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet'
import {
    Building2,
    Loader2,
    Check,
    Plus,
} from 'lucide-react'
import { createDepartment, updateDepartment } from '@/app/actions/departments'

const departmentSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    description: z.string().optional(),
})

type DepartmentFormData = z.infer<typeof departmentSchema>

interface DepartmentFormSheetProps {
    departmentId?: string | null
    initialData?: { name: string; description?: string | null }
    open: boolean
    onOpenChange: (open: boolean) => void
    trigger?: React.ReactNode
}

export function DepartmentFormSheet({ departmentId, initialData, open, onOpenChange, trigger }: DepartmentFormSheetProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const isEditing = !!departmentId

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<DepartmentFormData>({
        resolver: zodResolver(departmentSchema),
        defaultValues: {
            name: '',
            description: '',
        },
    })

    useEffect(() => {
        if (open) {
            if (initialData) {
                reset({
                    name: initialData.name,
                    description: initialData.description || '',
                })
            } else if (!isEditing) {
                reset({
                    name: '',
                    description: '',
                })
            }
        }
    }, [open, initialData, isEditing, reset])

    async function onSubmit(data: DepartmentFormData) {
        setLoading(true)
        try {
            if (isEditing && departmentId) {
                await updateDepartment(departmentId, data)
            } else {
                await createDepartment(data)
            }
            setSuccess(true)
            setTimeout(() => {
                onOpenChange(false)
                setSuccess(false)
                router.refresh()
            }, 1200)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <Sheet open={open} onOpenChange={onOpenChange}>
                {trigger && <div onClick={() => onOpenChange(true)}>{trigger}</div>}
                <SheetContent className="w-full sm:max-w-md">
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                            <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                            {isEditing ? 'Department Updated!' : 'Department Created!'}
                        </h3>
                    </div>
                </SheetContent>
            </Sheet>
        )
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            {trigger && <div onClick={() => onOpenChange(true)}>{trigger}</div>}
            <SheetContent className="w-full sm:max-w-md overflow-y-auto px-4">
                <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <Building2 className="h-5 w-5 text-blue-500" />
                                Edit Department
                            </>
                        ) : (
                            <>
                                <Plus className="h-5 w-5 text-blue-500" />
                                Create Department
                            </>
                        )}
                    </SheetTitle>
                    <SheetDescription>
                        {isEditing ? 'Update department details' : 'Add a new ministry or department'}
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Department Name *</Label>
                        <Input
                            id="name"
                            {...register('name')}
                            placeholder="e.g. Youth Ministry"
                        />
                        {errors.name && (
                            <p className="text-xs text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            {...register('description')}
                            placeholder="Describe the department's purpose..."
                            className="resize-none"
                            rows={4}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-linear-to-r from-blue-600 to-indigo-600"
                        >
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {isEditing ? 'Save Changes' : 'Create Department'}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    )
}
