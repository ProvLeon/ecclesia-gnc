'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { getMember, updateMember } from '@/app/actions/members'
import { MemberProfileUploader } from '@/components/member-profile-uploader'

const memberSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  middleName: z.string().optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phonePrimary: z.string().min(10, 'Phone number must be at least 10 digits'),
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
  joinDate: z.string().min(1, 'Join date is required'),
  baptismDate: z.string().optional(),
  isBaptized: z.boolean().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  notes: z.string().optional(),
})

type MemberFormData = z.infer<typeof memberSchema>

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditMemberPage({ params }: PageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [memberId, setMemberId] = useState<string>('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
  })

  const firstName = watch('firstName')
  const lastName = watch('lastName')

  useEffect(() => {
    async function loadMember() {
      const { id } = await params
      setMemberId(id)
      const member = await getMember(id)
      if (member) {
        setPhotoUrl(member.photoUrl)
        reset({
          firstName: member.firstName,
          middleName: member.middleName || '',
          lastName: member.lastName,
          phonePrimary: member.phonePrimary,
          phoneSecondary: member.phoneSecondary || '',
          email: member.email || '',
          dateOfBirth: member.dateOfBirth || '',
          gender: (member.gender || undefined) as 'male' | 'female' | undefined,
          maritalStatus: (member.maritalStatus || undefined) as 'single' | 'married' | 'divorced' | 'widowed' | undefined,
          address: member.address || '',
          city: member.city || '',
          region: member.region || '',
          occupation: member.occupation || '',
          memberStatus: member.memberStatus as 'active' | 'inactive' | 'visitor' | 'new_convert',
          joinDate: member.joinDate,
          baptismDate: member.baptismDate || '',
          isBaptized: member.isBaptized ?? false,
          emergencyContactName: member.emergencyContactName || '',
          emergencyContactPhone: member.emergencyContactPhone || '',
          notes: member.notes || '',
        })
      }
      setIsLoading(false)
    }
    loadMember()
  }, [params, reset])


  async function onSubmit(data: MemberFormData) {
    setIsSubmitting(true)
    setError(null)

    try {
      await updateMember(memberId, {
        ...data,
        email: data.email || undefined,
        isBaptized: data.isBaptized ?? false,
      })
      router.push(`/members/${memberId}`)
    } catch (err) {
      setError('Failed to update member. Please try again.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/members/${memberId}`}>
          <Button variant="outline" size="icon" className="h-9 w-9 bg-white dark:bg-slate-800">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Edit Member
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Update member information
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-6">

        {/* Left Column: Avatar & Identity */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="pt-10 flex flex-col items-center">
              <div className="mb-6">
                <MemberProfileUploader
                  memberId={memberId}
                  firstName={firstName || ''}
                  lastName={lastName || ''}
                  currentPhotoUrl={photoUrl}
                  size="xl"
                />
              </div>

              <div className="w-full space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" {...register('firstName')} className="bg-slate-50 dark:bg-slate-900" />
                  {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input id="middleName" {...register('middleName')} className="bg-slate-50 dark:bg-slate-900" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" {...register('lastName')} className="bg-slate-50 dark:bg-slate-900" />
                  {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button Mobile/Desktop consistent placement? 
               Usually form actions are at bottom or top right. 
               Let's put them at the bottom of the right column or sticky?
           */}
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-6">

          {/* Personal Details (Remaining) */}
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} className="bg-slate-50 dark:bg-slate-900" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select onValueChange={(value) => setValue('gender', value as 'male' | 'female')}>
                  <SelectTrigger className="bg-slate-50 dark:bg-slate-900">
                    <SelectValue placeholder={!isLoading ? "Select gender" : "Loading..."} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maritalStatus">Marital Status</Label>
                <Select onValueChange={(value) => setValue('maritalStatus', value as 'single' | 'married' | 'divorced' | 'widowed')}>
                  <SelectTrigger className="bg-slate-50 dark:bg-slate-900">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input id="occupation" {...register('occupation')} className="bg-slate-50 dark:bg-slate-900" />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phonePrimary">Primary Phone *</Label>
                <Input id="phonePrimary" {...register('phonePrimary')} className="bg-slate-50 dark:bg-slate-900" />
                {errors.phonePrimary && <p className="text-sm text-red-500">{errors.phonePrimary.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneSecondary">Secondary Phone</Label>
                <Input id="phoneSecondary" {...register('phoneSecondary')} className="bg-slate-50 dark:bg-slate-900" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} className="bg-slate-50 dark:bg-slate-900" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...register('address')} className="bg-slate-50 dark:bg-slate-900" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City/Town</Label>
                <Input id="city" {...register('city')} className="bg-slate-50 dark:bg-slate-900" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input id="region" {...register('region')} className="bg-slate-50 dark:bg-slate-900" />
              </div>
            </CardContent>
          </Card>

          {/* Church Information */}
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Church Information</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="memberStatus">Member Status *</Label>
                <Select onValueChange={(value) => setValue('memberStatus', value as 'active' | 'inactive' | 'visitor' | 'new_convert')}>
                  <SelectTrigger className="bg-slate-50 dark:bg-slate-900">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="visitor">Visitor</SelectItem>
                    <SelectItem value="new_convert">New Convert</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="joinDate">Join Date *</Label>
                <Input id="joinDate" type="date" {...register('joinDate')} className="bg-slate-50 dark:bg-slate-900" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="baptismDate">Baptism Date</Label>
                <Input id="baptismDate" type="date" {...register('baptismDate')} className="bg-slate-50 dark:bg-slate-900" />
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">Contact Name</Label>
                <Input id="emergencyContactName" {...register('emergencyContactName')} className="bg-slate-50 dark:bg-slate-900" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                <Input id="emergencyContactPhone" {...register('emergencyContactPhone')} className="bg-slate-50 dark:bg-slate-900" />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <Link href={`/members/${memberId}`}>
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" />Save Changes</>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
