'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Loader2, Calendar } from 'lucide-react'
import { createService } from '@/app/actions/attendance'

const serviceSchema = z.object({
    name: z.string().min(2, 'Service name is required'),
    serviceType: z.string().min(1, 'Service type is required'),
    serviceDate: z.string().min(1, 'Date is required'),
    serviceTime: z.string().optional(),
    location: z.string().optional(),
    notes: z.string().optional(),
})

type ServiceFormData = z.infer<typeof serviceSchema>

export default function NewServicePage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<ServiceFormData>({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            serviceDate: new Date().toISOString().split('T')[0],
            serviceType: 'Sunday Service',
        },
    })

    async function onSubmit(data: ServiceFormData) {
        setIsSubmitting(true)
        setError(null)
        try {
            const service = await createService(data)
            router.push(`/attendance/${service.id}`)
        } catch {
            setError('Failed to create service')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/attendance">
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Service</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Create a service to record attendance</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-slate-400" />
                            Service Details
                        </CardTitle>
                        <CardDescription>Enter the service information</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Service Name *</Label>
                            <Input id="name" {...register('name')} placeholder="e.g. Sunday Worship" className="bg-slate-50 dark:bg-slate-900" />
                            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="serviceType">Service Type *</Label>
                            <Select defaultValue="Sunday Service" onValueChange={(v) => setValue('serviceType', v)}>
                                <SelectTrigger className="bg-slate-50 dark:bg-slate-900">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Sunday Service">Sunday Service</SelectItem>
                                    <SelectItem value="Midweek Service">Midweek Service</SelectItem>
                                    <SelectItem value="Prayer Meeting">Prayer Meeting</SelectItem>
                                    <SelectItem value="Bible Study">Bible Study</SelectItem>
                                    <SelectItem value="Special Event">Special Event</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="serviceDate">Date *</Label>
                            <Input id="serviceDate" type="date" {...register('serviceDate')} className="bg-slate-50 dark:bg-slate-900" />
                            {errors.serviceDate && <p className="text-sm text-red-500">{errors.serviceDate.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="serviceTime">Time</Label>
                            <Input id="serviceTime" type="time" {...register('serviceTime')} className="bg-slate-50 dark:bg-slate-900" />
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" {...register('location')} placeholder="e.g. Main Auditorium" className="bg-slate-50 dark:bg-slate-900" />
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea id="notes" {...register('notes')} placeholder="Any additional notes..." className="bg-slate-50 dark:bg-slate-900" />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Link href="/attendance">
                        <Button type="button" variant="outline">Cancel</Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</>
                            : <><Save className="mr-2 h-4 w-4" />Create & Record Attendance</>}
                    </Button>
                </div>
            </form>
        </div>
    )
}
