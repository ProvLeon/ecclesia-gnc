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
import { toast } from 'sonner'
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
import { Skeleton } from '@/components/ui/skeleton'
import { createMember, getMember, updateMember } from '@/app/actions/members'
import { MemberProfileUploader } from '@/components/member-profile-uploader'

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
    initialData?: any
    open: boolean
    onOpenChange: (open: boolean) => void
    trigger?: React.ReactNode
}

const TABS = ['personal', 'contact', 'church', 'emergency'] as const
type TabType = typeof TABS[number]

export function MemberFormSheet({ memberId, initialData, open, onOpenChange, trigger }: MemberFormSheetProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<TabType>('personal')
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(false)
    const [success, setSuccess] = useState(false)
    const [photoUrl, setPhotoUrl] = useState<string | null>(null)

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
            // If we have initial data, use it immediately
            if (initialData) {
                reset({
                    firstName: initialData.firstName,
                    middleName: initialData.middleName || '',
                    lastName: initialData.lastName,
                    phonePrimary: initialData.phonePrimary || '',
                    phoneSecondary: initialData.phoneSecondary || '',
                    email: initialData.email || '',
                    dateOfBirth: initialData.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : '',
                    gender: initialData.gender as any,
                    maritalStatus: initialData.maritalStatus as any,
                    address: initialData.address || '',
                    city: initialData.city || '',
                    region: initialData.region || '',
                    occupation: initialData.occupation || '',
                    memberStatus: initialData.memberStatus as any || 'active',
                    joinDate: initialData.joinDate ? new Date(initialData.joinDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    baptismDate: initialData.baptismDate ? new Date(initialData.baptismDate).toISOString().split('T')[0] : '',
                    isBaptized: initialData.isBaptized || false,
                    emergencyContactName: initialData.emergencyContactName || '',
                    emergencyContactPhone: initialData.emergencyContactPhone || '',
                    notes: initialData.notes || '',
                })
                setPhotoUrl(initialData.photoUrl || null)
                return
            }

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
                        dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth).toISOString().split('T')[0] : '',
                        gender: member.gender as any,
                        maritalStatus: member.maritalStatus as any,
                        address: member.address || '',
                        city: member.city || '',
                        region: member.region || '',
                        occupation: member.occupation || '',
                        memberStatus: member.memberStatus as any || 'active',
                        joinDate: member.joinDate ? new Date(member.joinDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                        baptismDate: member.baptismDate ? new Date(member.baptismDate).toISOString().split('T')[0] : '',
                        isBaptized: member.isBaptized || false,
                        emergencyContactName: member.emergencyContactName || '',
                        emergencyContactPhone: member.emergencyContactPhone || '',
                        notes: member.notes || '',
                    })
                    setPhotoUrl(member.photoUrl || null)
                }
                setFetching(false)
            })
        }
    }, [memberId, open, reset, initialData])

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
                await createMember({ ...data, email: data.email || undefined, photoUrl: photoUrl || undefined })
            }
            setSuccess(true)
            setTimeout(() => {
                onOpenChange(false)
                router.refresh()
            }, 1200)
        } catch (err) {
            console.error(err)
            toast.error('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const onInvalid = (errors: any) => {
        const errorFields = Object.keys(errors)
        if (errorFields.length > 0) {
            toast.error(`Please fix ${errorFields.length} error(s) before saving.`, {
                description: 'Check fields marked in red.'
            })

            // Auto-switch to the first tab with an error if current tab is valid
            // Mapping fields to tabs (simplified logic)
            const personalFields = ['firstName', 'lastName', 'joinDate']
            const contactFields = ['phonePrimary', 'email']

            const hasPersonalError = personalFields.some(f => errors[f])
            const hasContactError = contactFields.some(f => errors[f])

            if (hasPersonalError && activeTab !== 'personal') setActiveTab('personal')
            else if (hasContactError && activeTab !== 'contact') setActiveTab('contact')
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
                        <div className="space-y-6">
                            {/* Tabs Skeleton */}
                            <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl mb-6 pb-2">
                                <div className="grid grid-cols-4 gap-2 p-1">
                                    {[1, 2, 3, 4].map((i) => (
                                        <Skeleton key={i} className="h-9 w-full rounded-lg" />
                                    ))}
                                </div>
                            </div>

                            {/* Form Fields Skeleton */}
                            <div className="space-y-4">
                                <div className="flex flex-col items-center justify-center mb-6">
                                    <Skeleton className="h-24 w-24 rounded-full" />
                                    <Skeleton className="h-4 w-32 mt-2" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="w-full">
                                <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl mb-6 pb-2">
                                    <TabsList className="grid grid-cols-4 w-full bg-transparent p-0 h-auto">
                                        <TabsTrigger
                                            value="personal"
                                            className="text-xs sm:text-sm py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm transition-all text-slate-500 rounded-lg"
                                        >
                                            <User className="h-4 w-4 sm:mr-1.5" />
                                            <span className="hidden sm:inline">Personal</span>
                                            {(errors.firstName || errors.lastName || errors.joinDate) && (
                                                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                                            )}
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="contact"
                                            className="text-xs sm:text-sm py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm transition-all text-slate-500 rounded-lg"
                                        >
                                            <Phone className="h-4 w-4 sm:mr-1.5" />
                                            <span className="hidden sm:inline">Contact</span>
                                            {(errors.phonePrimary || errors.email) && (
                                                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                                            )}
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="church"
                                            className="text-xs sm:text-sm py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm transition-all text-slate-500 rounded-lg"
                                        >
                                            <Heart className="h-4 w-4 sm:mr-1.5" />
                                            <span className="hidden sm:inline">Church</span>
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="emergency"
                                            className="text-xs sm:text-sm py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm transition-all text-slate-500 rounded-lg"
                                        >
                                            <AlertCircle className="h-4 w-4 sm:mr-1.5" />
                                            <span className="hidden sm:inline">Emergency</span>
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                {/* Personal Tab */}
                                <TabsContent value="personal" className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                    {/* Uploader Section */}
                                    <div className="flex flex-col items-center justify-center mb-6">
                                        <MemberProfileUploader
                                            memberId={memberId || undefined}
                                            firstName={watch('firstName') || ''}
                                            lastName={watch('lastName') || ''}
                                            currentPhotoUrl={photoUrl}
                                            onUploadComplete={(url) => setPhotoUrl(url)}
                                            size="xl"
                                        />
                                        <p className="text-xs text-slate-500 mt-2">Click to upload photo</p>
                                    </div>
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

                                <div className="flex gap-2 flex-1 justify-end">
                                    {activeTab !== 'emergency' && (
                                        <Button
                                            type="button"
                                            onClick={() => goToTab('next')}
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-linear-to-r from-blue-600 to-indigo-600"
                                    >
                                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        {isEditing ? 'Save Changes' : 'Add Member'}
                                    </Button>
                                </div>
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
