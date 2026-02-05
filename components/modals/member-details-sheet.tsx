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
} from 'lucide-react'
import { getMember } from '@/app/actions/members'
import { PromoteToShepherdModal } from '@/components/modals/promote-shepherd-modal'

interface MemberDetailsSheetProps {
  memberId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  visitor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  new_convert: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
}

type MemberData = Awaited<ReturnType<typeof getMember>>

export function MemberDetailsSheet({ memberId, open, onOpenChange }: MemberDetailsSheetProps) {
  const [member, setMember] = useState<MemberData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (memberId && open) {
      let isMounted = true

      const loadMember = async () => {
        if (isMounted) {
          setLoading(true)
        }
        try {
          const data = await getMember(memberId)
          if (isMounted) {
            setMember(data)
            setLoading(false)
          }
        } catch (error) {
          if (isMounted) {
            setLoading(false)
            console.error('Failed to load member:', error)
          }
        }
      }

      void loadMember()

      return () => {
        isMounted = false
      }
    }
  }, [memberId, open])

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : member ? (
          <>
            <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-800">
              {/* Header */}
              <SheetHeader className="text-left mb-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20 ring-4 ring-slate-50 dark:ring-slate-900">
                    <AvatarImage src={member.photoUrl || ''} />
                    <AvatarFallback className="bg-linear-to-br from-blue-600 to-indigo-600 text-white text-2xl font-medium">
                      {member.firstName[0]}{member.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 pt-1">
                    <SheetTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                      {member.firstName} {member.lastName}
                    </SheetTitle>
                    <div className="flex items-center gap-2 mt-1.5">
                      <p className="text-sm font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                        {member.memberId}
                      </p>
                      <Badge
                        variant="secondary"
                        className={`${STATUS_COLORS[member.memberStatus || 'active']} border-0`}
                      >
                        {member.memberStatus?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              </SheetHeader>

              {/* Quick Actions */}
              <div className="flex gap-3">
                <Link href={`/members/${memberId}/edit`} className="flex-1">
                  <Button variant="outline" className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs border-slate-200 dark:border-slate-700">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
                <PromoteToShepherdModal
                  memberId={memberId!}
                  memberName={`${member.firstName} ${member.lastName}`}
                  trigger={
                    <Button variant="outline" className="flex-1 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs border-slate-200 dark:border-slate-700">
                      <Shield className="h-4 w-4 mr-2" />
                      Promote
                    </Button>
                  }
                />
              </div>

              <Separator />
            </div>

            <div className="p-6 space-y-8">

              {/* Contact Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Contact Information
                </h3>
                <div className="space-y-2.5">
                  {member.phonePrimary && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <Phone className="h-4 w-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-slate-900 dark:text-white">{member.phonePrimary}</p>
                        <p className="text-xs text-slate-500">Primary</p>
                      </div>
                      <Link href={`tel:${member.phonePrimary}`} className="ml-auto">
                        <Button size="sm" variant="ghost">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  )}
                  {member.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <Mail className="h-4 w-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-slate-900 dark:text-white truncate max-w-48">{member.email}</p>
                        <p className="text-xs text-slate-500">Email</p>
                      </div>
                      <Link href={`mailto:${member.email}`} className="ml-auto">
                        <Button size="sm" variant="ghost">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  )}
                  {(member.address || member.city) && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <MapPin className="h-4 w-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-slate-900 dark:text-white">
                          {[member.address, member.city, member.region].filter(Boolean).join(', ')}
                        </p>
                        <p className="text-xs text-slate-500">Address</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Personal Details */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Personal Details
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <InfoItem label="Date of Birth" value={formatDate(member.dateOfBirth)} />
                  <InfoItem label="Gender" value={member.gender === 'male' ? 'Male' : member.gender === 'female' ? 'Female' : '-'} />
                  <InfoItem label="Marital Status" value={member.maritalStatus ? member.maritalStatus.charAt(0).toUpperCase() + member.maritalStatus.slice(1) : '-'} />
                  <InfoItem label="Occupation" value={member.occupation || '-'} />
                </div>
              </div>

              <Separator />

              {/* Church Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Church Information
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <InfoItem label="Join Date" value={formatDate(member.joinDate)} />
                  <InfoItem label="Baptized" value={member.isBaptized ? 'Yes' : 'No'} />
                  {member.baptismDate && (
                    <InfoItem label="Baptism Date" value={formatDate(member.baptismDate)} />
                  )}
                </div>
              </div>

              {/* Notes */}
              {member.notes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notes</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                      {member.notes}
                    </p>
                  </div>
                </>
              )}


              {/* View Full Profile Link - Optional/Contextual */}
              <div className="pt-2">
                <Link href={`/members/${memberId}`}>
                  <Button variant="ghost" className="w-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                    View Full Profile Details
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <User className="h-12 w-12 mb-2" />
            <p>Member not found</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-900 dark:text-white">{value}</p>
    </div>
  )
}
