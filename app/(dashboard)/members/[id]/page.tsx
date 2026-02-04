import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getMember } from '@/app/actions/members'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
    ArrowLeft,
    Pencil,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Briefcase,
    Heart,
    User,
    AlertCircle,
    Shield,
} from 'lucide-react'
import { PromoteToShepherdModal } from '@/components/modals'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function MemberProfilePage({ params }: PageProps) {
    const { id } = await params
    const member = await getMember(id)

    if (!member) {
        notFound()
    }

    const statusColors = {
        active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        inactive: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        visitor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        new_convert: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    }

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/members">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Member Profile
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            View and manage member information
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <PromoteToShepherdModal
                        memberId={id}
                        memberName={`${member.firstName} ${member.lastName}`}
                        trigger={
                            <Button variant="outline">
                                <Shield className="h-4 w-4 mr-2" />
                                Make Shepherd
                            </Button>
                        }
                    />
                    <Link href={`/members/${id}/edit`}>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Profile Card */}
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 lg:col-span-1">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                            <Avatar className="h-24 w-24 mb-4">
                                <AvatarImage src={member.photoUrl || ''} />
                                <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-2xl">
                                    {member.firstName[0]}
                                    {member.lastName[0]}
                                </AvatarFallback>
                            </Avatar>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {member.firstName} {member.middleName ? `${member.middleName} ` : ''}{member.lastName}
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 font-mono mt-1">
                                {member.memberId}
                            </p>
                            <Badge
                                variant="secondary"
                                className={`mt-3 ${statusColors[member.memberStatus as keyof typeof statusColors]}`}
                            >
                                {member.memberStatus?.replace('_', ' ')}
                            </Badge>

                            <Separator className="my-6" />

                            <div className="w-full space-y-4 text-left">
                                {member.phonePrimary && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Phone className="h-4 w-4 text-slate-400" />
                                        <span className="text-slate-600 dark:text-slate-300">{member.phonePrimary}</span>
                                    </div>
                                )}
                                {member.email && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Mail className="h-4 w-4 text-slate-400" />
                                        <span className="text-slate-600 dark:text-slate-300">{member.email}</span>
                                    </div>
                                )}
                                {(member.address || member.city) && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <MapPin className="h-4 w-4 text-slate-400" />
                                        <span className="text-slate-600 dark:text-slate-300">
                                            {[member.address, member.city, member.region].filter(Boolean).join(', ')}
                                        </span>
                                    </div>
                                )}
                                {member.occupation && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Briefcase className="h-4 w-4 text-slate-400" />
                                        <span className="text-slate-600 dark:text-slate-300">{member.occupation}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Details */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Personal Details */}
                    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-slate-400" />
                                Personal Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <DetailItem label="Date of Birth" value={formatDate(member.dateOfBirth)} />
                                <DetailItem label="Gender" value={member.gender ? (member.gender === 'male' ? 'Male' : 'Female') : '-'} />
                                <DetailItem
                                    label="Marital Status"
                                    value={member.maritalStatus ? member.maritalStatus.charAt(0).toUpperCase() + member.maritalStatus.slice(1) : '-'}
                                />
                                <DetailItem label="Phone (Primary)" value={member.phonePrimary || '-'} />
                                <DetailItem label="Phone (Secondary)" value={member.phoneSecondary || '-'} />
                                <DetailItem label="Email" value={member.email || '-'} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Church Details */}
                    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Heart className="h-5 w-5 text-slate-400" />
                                Church Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <DetailItem label="Member Status" value={member.memberStatus?.replace('_', ' ') || '-'} />
                                <DetailItem label="Join Date" value={formatDate(member.joinDate)} />
                                <DetailItem label="Baptized" value={member.isBaptized ? 'Yes' : 'No'} />
                                <DetailItem label="Baptism Date" value={formatDate(member.baptismDate)} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Emergency Contact */}
                    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-slate-400" />
                                Emergency Contact
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <DetailItem label="Name" value={member.emergencyContactName || '-'} />
                                <DetailItem label="Phone" value={member.emergencyContactPhone || '-'} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    {member.notes && (
                        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            <CardHeader>
                                <CardTitle>Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                                    {member.notes}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">{value}</p>
        </div>
    )
}
