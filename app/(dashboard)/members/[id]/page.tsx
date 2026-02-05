import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getMember } from '@/app/actions/members'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MemberProfileUploader } from '@/components/member-profile-uploader'
import {
  ArrowLeft,
  Shield,
  Pencil,
  Phone,
  User,
  Heart,
  AlertCircle,
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
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    inactive: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    visitor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    new_convert: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/members">
            <Button variant="outline" size="icon" className="h-9 w-9 bg-white dark:bg-slate-800">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Member Profile
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              View and manage member information
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PromoteToShepherdModal
            memberId={id}
            memberName={`${member.firstName} ${member.lastName}`}
            trigger={
              <Button variant="outline" className="bg-white dark:bg-slate-800">
                <Shield className="h-4 w-4 mr-2" />
                Make Shepherd
              </Button>
            }
          />
          <Link href={`/members/${id}/edit`}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Pencil className="h-3.5 w-3.5 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1">
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm h-full max-h-[500px]">
            <CardContent className="pt-10 flex flex-col items-center text-center">
              <MemberProfileUploader
                memberId={member.id}
                firstName={member.firstName}
                lastName={member.lastName}
                currentPhotoUrl={member.photoUrl}
                size="xl"
              />

              <div className="mt-4 mb-6 space-y-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {member.firstName} {member.lastName}
                </h2>
                <p className="text-sm font-mono text-slate-500">
                  {member.memberId}
                </p>
                <div>
                  <Badge className={`${statusColors[member.memberStatus as keyof typeof statusColors] || statusColors.active} hover:${statusColors[member.memberStatus as keyof typeof statusColors] || statusColors.active} border-0 capitalize px-3 py-1 font-medium`}>
                    {member.memberStatus?.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <Separator className="w-full mb-6" />

              <div className="w-full space-y-4">
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {member.phonePrimary || 'No phone number'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-6">

          {/* Personal Details */}
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 pb-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-500" />
                <CardTitle className="text-base font-semibold">Personal Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-4">
              <InfoItem label="Date of Birth" value={formatDate(member.dateOfBirth)} />
              <InfoItem label="Gender" value={member.gender || '-'} capitalize />
              <InfoItem label="Marital Status" value={member.maritalStatus || '-'} capitalize />
              <InfoItem label="Phone (Primary)" value={member.phonePrimary || '-'} />
              <InfoItem label="Phone (Secondary)" value={member.phoneSecondary || '-'} />
              <InfoItem label="Email" value={member.email || '-'} />
            </CardContent>
          </Card>

          {/* Church Information */}
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 pb-4">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-slate-500" />
                <CardTitle className="text-base font-semibold">Church Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-4">
              <InfoItem label="Member Status" value={member.memberStatus?.replace('_', ' ') || '-'} capitalize />
              <InfoItem label="Join Date" value={formatDate(member.joinDate)} />
              <InfoItem label="Baptized" value={member.isBaptized ? 'Yes' : 'No'} />
              <InfoItem label="Baptism Date" value={formatDate(member.baptismDate)} />
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 pb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-slate-500" />
                <CardTitle className="text-base font-semibold">Emergency Contact</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-4">
              <InfoItem label="Name" value={member.emergencyContactName || '-'} />
              <InfoItem label="Phone" value={member.emergencyContactPhone || '-'} />
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, value, capitalize = false }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`text-sm font-medium text-slate-900 dark:text-white ${capitalize ? 'capitalize' : ''}`}>
        {value}
      </p>
    </div>
  )
}
<AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-4xl font-semibold">
  {getInitials()}
</AvatarFallback>
                </Avatar >

  {/* Name and ID */ }
  < div >
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                    {member.firstName} {member.middleName ? `${member.middleName} ` : ''}{member.lastName}
                  </h2>
                  <p className="text-sm font-mono text-slate-500 dark:text-slate-400 mt-1">
                    {member.memberId}
                  </p>
                </div >

  {/* Status Badge */ }
  < Badge
className = {`px-3 py-1 ${statusColors[member.memberStatus as keyof typeof statusColors]} capitalize font-medium`}
                >
  { member.memberStatus?.replace('_', ' ') }
                </Badge >

  {/* Divider */ }
  < div className = "w-full h-px bg-slate-200 dark:bg-slate-700 my-2" ></div >

    {/* Contact Info */ }
    < div className = "w-full space-y-3 text-left" >
    {
      member.phonePrimary && (
        <div className="flex items-start gap-3">
          <Phone className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400">Phone</p>
            <a
              href={`tel:${member.phonePrimary}`}
              className="font-medium text-slate-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 break-all"
            >
              {member.phonePrimary}
            </a>
          </div>
        </div>
      )
    }

{
  member.email && (
    <div className="flex items-start gap-3">
      <Mail className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
        <a
          href={`mailto:${member.email}`}
          className="font-medium text-slate-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 truncate"
        >
          {member.email}
        </a>
      </div>
    </div>
  )
}

{
  (member.address || member.city || member.region) && (
    <div className="flex items-start gap-3">
      <MapPin className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400">Address</p>
        <p className="font-medium text-slate-900 dark:text-white text-sm">
          {[member.address, member.city, member.region].filter(Boolean).join(', ')}
        </p>
      </div>
    </div>
  )
}

{
  member.occupation && (
    <div className="flex items-start gap-3">
      <Briefcase className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400">Occupation</p>
        <p className="font-medium text-slate-900 dark:text-white text-sm">{member.occupation}</p>
      </div>
    </div>
  )
}
                </div >
              </div >
            </CardContent >
          </Card >
        </div >

  {/* Right: Details Sections */ }
  < div className = "space-y-6 lg:col-span-2" >
    {/* Personal Details */ }
    < Card className = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" >
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
          <User className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Personal Details</h3>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <DetailField label="Date of Birth" value={formatDate(member.dateOfBirth)} />
          <DetailField
            label="Gender"
            value={member.gender ? member.gender.charAt(0).toUpperCase() + member.gender.slice(1) : '-'}
          />
          <DetailField
            label="Marital Status"
            value={member.maritalStatus ? member.maritalStatus.charAt(0).toUpperCase() + member.maritalStatus.slice(1) : '-'}
          />
          <DetailField label="Phone (Primary)" value={member.phonePrimary || '-'} />
          <DetailField label="Phone (Secondary)" value={member.phoneSecondary || '-'} />
          <DetailField label="Email" value={member.email || '-'} />
        </div>
      </CardContent>
          </Card >

  {/* Church Information */ }
  < Card className = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" >
    <CardContent className="pt-6">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
        <Heart className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Church Information</h3>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <DetailField
          label="Member Status"
          value={member.memberStatus?.replace('_', ' ') || '-'}
          isBadge
          badgeColor={statusColors[member.memberStatus as keyof typeof statusColors]}
        />
        <DetailField label="Join Date" value={formatDate(member.joinDate)} />
        <DetailField label="Baptized" value={member.isBaptized ? 'Yes' : 'No'} />
        <DetailField label="Baptism Date" value={formatDate(member.baptismDate)} />
      </div>
    </CardContent>
          </Card >

  {/* Emergency Contact */ }
  < Card className = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" >
    <CardContent className="pt-6">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
        <AlertCircle className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Emergency Contact</h3>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <DetailField label="Name" value={member.emergencyContactName || '-'} />
        <DetailField label="Phone" value={member.emergencyContactPhone || '-'} />
      </div>
    </CardContent>
          </Card >

  {/* Notes */ }
{
  member.notes && (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Notes</h3>
        <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
          {member.notes}
        </p>
      </CardContent>
    </Card>
  )
}
        </div >
      </div >
    </div >
  )
}

interface DetailFieldProps {
  label: string
  value: string
  isBadge?: boolean
  badgeColor?: string
}

function DetailField({ label, value, isBadge, badgeColor }: DetailFieldProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
      {isBadge ? (
        <Badge className={`w-fit ${badgeColor}`}>
          {value}
        </Badge>
      ) : (
        <p className="text-base font-medium text-slate-900 dark:text-white">{value}</p>
      )}
    </div>
  )
}
