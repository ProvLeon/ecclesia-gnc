'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Pencil,
  Shield,
  MessageSquare,
  Heart,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { getMember } from '@/app/actions/members'
import { PromoteToShepherdModal } from '@/components/modals/promote-shepherd-modal'
import { MemberProfileUploader } from '@/components/member-profile-uploader'
import { Card, CardContent } from '@/components/ui/card'

interface MemberDetailsSheetProps {
  memberId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (member: MemberData) => void
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  visitor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  new_convert: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

type MemberData = Awaited<ReturnType<typeof getMember>>

export function MemberDetailsSheet({ memberId, open, onOpenChange, onEdit }: MemberDetailsSheetProps) {
  const [member, setMember] = useState<MemberData | null>(null)
  const [loading, setLoading] = useState(false)

  // Reload member data when sheet opens or ID changes
  useEffect(() => {
    if (memberId && open) {
      let isMounted = true
      const loadMember = async () => {
        setLoading(true)
        try {
          const data = await getMember(memberId)
          if (isMounted) {
            setMember(data)
            setLoading(false)
          }
        } catch (error) {
          if (isMounted) setLoading(false)
        }
      }
      void loadMember()
      return () => { isMounted = false }
    }
  }, [memberId, open])

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // Handle uploader completing - refresh local data
  const handleUploadComplete = (url: string) => {
    if (member) {
      setMember({ ...member, photoUrl: url })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0 border-l border-slate-200 dark:border-slate-800">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <p className="text-sm text-slate-500">Loading profile...</p>
            </div>
          </div>
        ) : member ? (
          <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950/50">
            {/* Hero / Header Section */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center pt-8">
              <MemberProfileUploader
                memberId={member.id}
                firstName={member.firstName}
                lastName={member.lastName}
                currentPhotoUrl={member.photoUrl}
                size="xl"
                onUploadComplete={handleUploadComplete}
              />

              <div className="text-center mt-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {member.firstName} {member.lastName}
                </h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 border border-slate-200 dark:border-slate-700">
                    {member.memberId}
                  </div>
                  <Badge className={`${STATUS_COLORS[member.memberStatus || 'active']} border-0`}>
                    {member.memberStatus?.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full mt-6">
                <Button
                  onClick={() => onEdit?.(member)}
                  variant="outline"
                  className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm"
                >
                  <Pencil className="h-3.5 w-3.5 mr-2 text-blue-600" />
                  Edit Profile
                </Button>
                <PromoteToShepherdModal
                  memberId={member.id}
                  memberName={`${member.firstName} ${member.lastName}`}
                  trigger={
                    <Button variant="outline" className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm">
                      <Shield className="h-3.5 w-3.5 mr-2 text-purple-600" />
                      Promote
                    </Button>
                  }
                />
              </div>
            </div>

            {/* Content Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">

              {/* Contact Card */}
              <Card className="shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Contact Details</span>
                </div>
                <CardContent className="p-4 space-y-4">
                  <InfoRow
                    icon={Phone}
                    label="Phone"
                    value={member.phonePrimary}
                    subValue="Primary"
                    action={member.phonePrimary ? <ActionLink href={`tel:${member.phonePrimary}`} icon={Phone} /> : null}
                  />
                  {member.email && (
                    <InfoRow
                      icon={Mail}
                      label="Email"
                      value={member.email}
                      action={<ActionLink href={`mailto:${member.email}`} icon={MessageSquare} />}
                    />
                  )}
                  {(member.address || member.city) && (
                    <InfoRow
                      icon={MapPin}
                      label="Address"
                      value={[member.address, member.city, member.region].filter(Boolean).join(', ')}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Personal Details */}
              <Card className="shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Personal Info</span>
                </div>
                <CardContent className="p-4 grid grid-cols-2 gap-4">
                  <GridItem label="Gender" value={member.gender ? member.gender.charAt(0).toUpperCase() + member.gender.slice(1) : '-'} />
                  <GridItem label="Marital Status" value={member.maritalStatus ? member.maritalStatus.charAt(0).toUpperCase() + member.maritalStatus.slice(1) : '-'} />
                  <GridItem label="Date of Birth" value={formatDate(member.dateOfBirth)} />
                  <GridItem label="Occupation" value={member.occupation || '-'} />
                </CardContent>
              </Card>

              {/* Church Info */}
              <Card className="shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
                  <Heart className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Church Status</span>
                </div>
                <CardContent className="p-4 grid grid-cols-2 gap-4">
                  <GridItem label="Joined" value={formatDate(member.joinDate)} />
                  <GridItem label="Baptized" value={member.isBaptized ? 'Yes' : 'No'} />
                  {member.baptismDate && <GridItem label="Baptism Date" value={formatDate(member.baptismDate)} />}
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              {(member.emergencyContactName || member.emergencyContactPhone) && (
                <Card className="shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Emergency Contact</span>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <InfoRow icon={User} label="Name" value={member.emergencyContactName} />
                    <InfoRow
                      icon={Phone}
                      label="Phone"
                      value={member.emergencyContactPhone}
                      action={member.emergencyContactPhone ? <ActionLink href={`tel:${member.emergencyContactPhone}`} icon={Phone} /> : null}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {member.notes && (
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-500 mb-2">Notes</h4>
                  <p className="text-sm text-amber-800 dark:text-amber-200/80 whitespace-pre-wrap">{member.notes}</p>
                </div>
              )}

              <div className="h-4"></div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <User className="h-12 w-12 mb-2 opacity-20" />
            <p>Member not found</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function InfoRow({ icon: Icon, label, value, subValue, action }: any) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{value}</p>
        {subValue && <p className="text-xs text-slate-500">{subValue}</p>}
        {!subValue && <p className="text-xs text-slate-500">{label}</p>}
      </div>
      {action}
    </div>
  )
}

function GridItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-900 dark:text-white">{value}</p>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-900 dark:text-white">{value}</p>
    </div>
  )
}

function ActionLink({ href, icon: Icon }: { href: string; icon: any }) {
  return (
    <Link href={href}>
      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-slate-500 hover:text-primary hover:bg-primary/10">
        <Icon className="h-4 w-4" />
      </Button>
    </Link>
  )
}
