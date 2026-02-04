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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import {
    User,
    Phone,
    Heart,
    AlertCircle,
    Loader2,
    Check,
    ChevronRight,
    ChevronLeft,
    Plus,
} from 'lucide-react'
import { createMember, getMember, updateMember } from '@/app/actions/members'

const memberSchema = z.object({
    firstName: z.string().min(2, 'First name required'),
    middleName: z.string().optional(),
    lastName: z.string().min(2, 'Last name required'),
    phonePrimary: z.string().min(10, 'Valid phone required'),
    phoneSecondary: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['male', 'female']).optional(),
    maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    region: z.string().optional(),
    occupation: z.string().optional(),
    memberStatus: z.enum(['active', 'inactive', 'visitor', 'new_convert']),
    joinDate: z.string().min(1, 'Join date required'),
    baptismDate: z.string().optional(),
    isBaptized: z.boolean(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    notes: z.string().optional(),
})

type MemberFormData = z.infer<typeof memberSchema>

interface MemberFormSheetProps {
    memberId?: string | null // null = new member, string = editing
    open: boolean
    onOpenChange: (open: boolean) => void
    trigger?: React.ReactNode
}

const TABS = ['personal', 'contact', 'church', 'emergency'] as const
type TabType = typeof TABS[number]

export function MemberFormSheet({ memberId, open, onOpenChange, trigger }: MemberFormSheetProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<TabType>('personal')
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(false)
    const [success, setSuccess] = useState(false)

    const isEditing = !!memberId

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<MemberFormData>({
        resolver: zodResolver(memberSchema),
        defaultValues: {
            memberStatus: 'active',
            isBaptized: false,
            joinDate: new Date().toISOString().split('T')[0],
        },
    })

    // Load member data when editing
    useEffect(() => {
        if (memberId && open) {
            setFetching(true)
            getMember(memberId).then((member) => {
                if (member) {
                    reset({
                        firstName: member.firstName,
                        middleName: member.middleName || '',
                        lastName: member.lastName,
                        phonePrimary: member.phonePrimary || '',
                        phoneSecondary: member.phoneSecondary || '',
                        email: member.email || '',
                        dateOfBirth: member.dateOfBirth || '',
                        gender: member.gender as any,
                        maritalStatus: member.maritalStatus as any,
                        address: member.address || '',
                        city: member.city || '',
                        region: member.region || '',
                        occupation: member.occupation || '',
                        memberStatus: member.memberStatus as any || 'active',
                        joinDate: member.joinDate || '',
                        baptismDate: member.baptismDate || '',
                        isBaptized: member.isBaptized || false,
                        emergencyContactName: member.emergencyContactName || '',
                        emergencyContactPhone: member.emergencyContactPhone || '',
                        notes: member.notes || '',
                    })
                }
                setFetching(false)
            })
        }
    }, [memberId, open, reset])

    useEffect(() => {
        if (!open) {
            setActiveTab('personal')
            setSuccess(false)
            if (!isEditing) {
                reset({
                    memberStatus: 'active',
                    isBaptized: false,
                    joinDate: new Date().toISOString().split('T')[0],
                })
            }
        }
    }, [open, reset, isEditing])

    async function onSubmit(data: MemberFormData) {
        setLoading(true)
        try {
            if (isEditing) {
                await updateMember(memberId!, { ...data, email: data.email || undefined })
            } else {
                await createMember({ ...data, email: data.email || undefined })
            }
            setSuccess(true)
            setTimeout(() => {
                onOpenChange(false)
                router.refresh()
            }, 1200)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    function goToTab(direction: 'next' | 'prev') {
        const currentIndex = TABS.indexOf(activeTab)
        if (direction === 'next' && currentIndex < TABS.length - 1) {
            setActiveTab(TABS[currentIndex + 1])
        } else if (direction === 'prev' && currentIndex > 0) {
            setActiveTab(TABS[currentIndex - 1])
        }
    }

    const watchedData = watch()

    if (success) {
        return (
            <Sheet open={open} onOpenChange={onOpenChange}>
                {trigger && <div onClick={() => onOpenChange(true)}>{trigger}</div>}
                <SheetContent className="w-full sm:max-w-xl">
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                            <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                            {isEditing ? 'Member Updated!' : 'Member Added!'}
                        </h3>
                        <p className="text-slate-500">
                            {watchedData.firstName} {watchedData.lastName}
                        </p>
                    </div>
                </SheetContent>
            </Sheet>
        )
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            {trigger && <div onClick={() => onOpenChange(true)}>{trigger}</div>}
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0">
                <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-800">
                    <SheetHeader>
                        <SheetTitle className="text-xl flex items-center gap-2">
                            {isEditing ? (
                                <>
                                    <User className="h-5 w-5 text-blue-500" />
                                    Edit Member
                                </>
                            ) : (
                                <>
                                    <Plus className="h-5 w-5 text-blue-500" />
                                    Add New Member
                                </>
                            )}
                        </SheetTitle>
                        <SheetDescription>
                            {isEditing ? 'Update member information' : 'Fill in the details to register a new member'}
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <div className="p-6">
                    {fetching ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
                                <TabsList className="grid grid-cols-4 mb-6">
                                    <TabsTrigger value="personal" className="text-xs sm:text-sm">
                                        <User className="h-4 w-4 sm:mr-1.5" />
                                        <span className="hidden sm:inline">Personal</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="contact" className="text-xs sm:text-sm">
                                        <Phone className="h-4 w-4 sm:mr-1.5" />
                                        <span className="hidden sm:inline">Contact</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="church" className="text-xs sm:text-sm">
                                        <Heart className="h-4 w-4 sm:mr-1.5" />
                                        <span className="hidden sm:inline">Church</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="emergency" className="text-xs sm:text-sm">
                                        <AlertCircle className="h-4 w-4 sm:mr-1.5" />
                                        <span className="hidden sm:inline">Emergency</span>
                                    </TabsTrigger>
                                </TabsList>

                                {/* Personal Tab */}
                                <TabsContent value="personal" className="space-y-4 mt-0">
                                    <div className="grid grid-cols-2 gap-3">
                                        <FormField label="First Name *" error={errors.firstName?.message}>
                                            <Input {...register('firstName')} placeholder="e.g., John" />
                                        </FormField>
                                        <FormField label="Last Name *" error={errors.lastName?.message}>
                                            <Input {...register('lastName')} placeholder="e.g., Mensah" />
                                        </FormField>
                                    </div>
                                    <FormField label="Middle Name">
                                        <Input {...register('middleName')} placeholder="Optional" />
                                    </FormField>
                                    <div className="grid grid-cols-2 gap-3">
                                        <FormField label="Date of Birth">
                                            <Input type="date" {...register('dateOfBirth')} />
                                        </FormField>
                                        <FormField label="Gender">
                                            <Select onValueChange={(v) => setValue('gender', v as any)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormField>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <FormField label="Marital Status">
                                            <Select onValueChange={(v) => setValue('maritalStatus', v as any)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="single">Single</SelectItem>
                                                    <SelectItem value="married">Married</SelectItem>
                                                    <SelectItem value="divorced">Divorced</SelectItem>
                                                    <SelectItem value="widowed">Widowed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormField>
                                        <FormField label="Occupation">
                                            <Input {...register('occupation')} placeholder="e.g., Teacher" />
                                        </FormField>
                                    </div>
                                </TabsContent>

                                {/* Contact Tab */}
                                <TabsContent value="contact" className="space-y-4 mt-0">
                                    <div className="grid grid-cols-2 gap-3">
                                        <FormField label="Primary Phone *" error={errors.phonePrimary?.message}>
                                            <Input {...register('phonePrimary')} placeholder="0XX XXX XXXX" />
                                        </FormField>
                                        <FormField label="Secondary Phone">
                                            <Input {...register('phoneSecondary')} placeholder="Optional" />
                                        </FormField>
                                    </div>
                                    <FormField label="Email" error={errors.email?.message}>
                                        <Input type="email" {...register('email')} placeholder="email@example.com" />
                                    </FormField>
                                    <FormField label="Address">
                                        <Input {...register('address')} placeholder="Street address" />
                                    </FormField>
                                    <div className="grid grid-cols-2 gap-3">
                                        <FormField label="City/Town">
                                            <Input {...register('city')} placeholder="e.g., Kumasi" />
                                        </FormField>
                                        <FormField label="Region">
                                            <Input {...register('region')} placeholder="e.g., Ashanti" />
                                        </FormField>
                                    </div>
                                </TabsContent>

                                {/* Church Tab */}
                                <TabsContent value="church" className="space-y-4 mt-0">
                                    <div className="grid grid-cols-2 gap-3">
                                        <FormField label="Member Status *">
                                            <Select
                                                defaultValue="active"
                                                onValueChange={(v) => setValue('memberStatus', v as any)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="visitor">Visitor</SelectItem>
                                                    <SelectItem value="new_convert">New Convert</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormField>
                                        <FormField label="Join Date *" error={errors.joinDate?.message}>
                                            <Input type="date" {...register('joinDate')} />
                                        </FormField>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                        <Checkbox
                                            id="isBaptized"
                                            checked={watch('isBaptized')}
                                            onCheckedChange={(c) => setValue('isBaptized', c === true)}
                                        />
                                        <Label htmlFor="isBaptized" className="cursor-pointer">
                                            Member has been baptized
                                        </Label>
                                    </div>
                                    {watch('isBaptized') && (
                                        <FormField label="Baptism Date">
                                            <Input type="date" {...register('baptismDate')} />
                                        </FormField>
                                    )}
                                    <FormField label="Notes">
                                        <Textarea
                                            {...register('notes')}
                                            placeholder="Any additional notes..."
                                            rows={3}
                                            className="resize-none"
                                        />
                                    </FormField>
                                </TabsContent>

                                {/* Emergency Tab */}
                                <TabsContent value="emergency" className="space-y-4 mt-0">
                                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                        <p className="text-sm text-amber-700 dark:text-amber-400">
                                            This information will only be used in case of emergencies.
                                        </p>
                                    </div>
                                    <FormField label="Contact Name">
                                        <Input {...register('emergencyContactName')} placeholder="Full name" />
                                    </FormField>
                                    <FormField label="Contact Phone">
                                        <Input {...register('emergencyContactPhone')} placeholder="Phone number" />
                                    </FormField>
                                </TabsContent>
                            </Tabs>

                            {/* Navigation & Submit */}
                            <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => goToTab('prev')}
                                    disabled={activeTab === 'personal'}
                                    className="w-24"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Back
                                </Button>

                                {activeTab === 'emergency' ? (
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-linear-to-r from-blue-600 to-indigo-600"
                                    >
                                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        {isEditing ? 'Save Changes' : 'Add Member'}
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={() => goToTab('next')}
                                        className="flex-1"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                )}
                            </div>
                        </form>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}

function FormField({
    label,
    error,
    children,
}: {
    label: string
    error?: string
    children: React.ReactNode
}) {
    return (
        <div className="space-y-1.5">
            <Label className="text-sm font-medium">{label}</Label>
            {children}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    )
}
