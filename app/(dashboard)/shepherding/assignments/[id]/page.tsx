import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  Users,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react'
import { db } from '@/lib/db'
import { shepherds, shepherdAssignments, members, followUps } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { DeleteAssignmentButton } from './delete-assignment-button'
import { AssignMemberDialog } from './assign-member-dialog'

interface ShepherdAssignmentDetailPageProps {
  params: Promise<{
    id: string
  }>
}

/**
 * Fetch shepherd details with member information
 */
async function getShepherd(shepherdId: string) {
  const [shepherd] = await db
    .select({
      id: shepherds.id,
      memberId: shepherds.memberId,
      assignedDate: shepherds.assignedDate,
      firstName: members.firstName,
      lastName: members.lastName,
      email: members.email,
      phone: members.phonePrimary,
      memberStatus: members.memberStatus,
    })
    .from(shepherds)
    .innerJoin(members, eq(shepherds.memberId, members.id))
    .where(and(
      eq(shepherds.id, shepherdId),
      eq(shepherds.isActive, true)
    ))
    .limit(1)

  return shepherd || null
}

/**
 * Fetch assignments for a specific shepherd with member details
 */
async function getShepherdAssignments(shepherdId: string) {
  return db
    .select({
      assignmentId: shepherdAssignments.id,
      assignedDate: shepherdAssignments.assignedDate,
      memberId: members.id,
      memberNumber: members.memberId,
      firstName: members.firstName,
      lastName: members.lastName,
      email: members.email,
      phone: members.phonePrimary,
      status: members.memberStatus,
    })
    .from(shepherdAssignments)
    .innerJoin(members, eq(shepherdAssignments.memberId, members.id))
    .where(and(
      eq(shepherdAssignments.shepherdId, shepherdId),
      eq(shepherdAssignments.isActive, true)
    ))
    .orderBy(members.firstName)
}

/**
 * Get unassigned members that can be assigned to shepherd
 */
async function getUnassignedMembers(shepherdId: string) {
  return db
    .select({
      id: members.id,
      firstName: members.firstName,
      lastName: members.lastName,
      phone: members.phonePrimary,
      email: members.email,
      memberId: members.memberId,
    })
    .from(members)
    .where(
      and(
        sql`${members.id} NOT IN (
          SELECT member_id FROM shepherd_assignments
          WHERE shepherd_id = ${shepherdId} AND is_active = true
        )`,
        eq(members.memberStatus, 'active')
      )
    )
    .orderBy(members.firstName)
    .limit(50)
}

/**
 * Get follow-up statistics for a member
 */
async function getFollowUpStats(memberId: string) {
  const [stats] = await db
    .select({
      pending: sql<number>`COUNT(CASE WHEN status = 'pending' THEN 1 END)`,
      completed: sql<number>`COUNT(CASE WHEN status = 'completed' THEN 1 END)`,
      overdue: sql<number>`COUNT(CASE WHEN status = 'pending' AND scheduled_date < CURRENT_DATE THEN 1 END)`,
    })
    .from(followUps)
    .where(eq(followUps.memberId, memberId))

  return {
    pending: Number(stats?.pending || 0),
    completed: Number(stats?.completed || 0),
    overdue: Number(stats?.overdue || 0),
  }
}

export default async function ShepherdAssignmentDetailPage({
  params,
}: ShepherdAssignmentDetailPageProps) {
  const { id: shepherdId } = await params

  // Fetch shepherd data
  const shepherd = await getShepherd(shepherdId)

  if (!shepherd) {
    notFound()
  }

  // Fetch assignments and unassigned members in parallel
  const [assignments, unassignedMembers] = await Promise.all([
    getShepherdAssignments(shepherdId),
    getUnassignedMembers(shepherdId),
  ])

  // Get follow-up stats for each member
  const statsMap = new Map()
  for (const assignment of assignments) {
    const stats = await getFollowUpStats(assignment.memberId)
    statsMap.set(assignment.memberId, stats)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <Link href="/shepherding/assignments">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Shepherd Profile
            </h1>
            <p className="text-sm text-slate-500">
              Manage assignments and member follow-ups
            </p>
          </div>
        </div>
      </div>

      {/* Shepherd Info Card */}
      <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-indigo-200 dark:border-indigo-800">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Avatar and Name */}
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg font-bold">
                  {shepherd.firstName[0]}{shepherd.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {shepherd.firstName} {shepherd.lastName}
                </p>
                <Badge variant="secondary" className="mt-1">
                  Shepherd
                </Badge>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Phone</p>
                  <a
                    href={`tel:${shepherd.phone}`}
                    className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {shepherd.phone}
                  </a>
                </div>
              </div>
              {shepherd.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <a
                      href={`mailto:${shepherd.email}`}
                      className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline text-sm truncate"
                    >
                      {shepherd.email}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Assignment Date */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500">Assigned Since</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {new Date(shepherd.assignedDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Assignment Count */}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500">Members Assigned</p>
                <p className="font-semibold text-slate-900 dark:text-white text-lg">
                  {assignments.length}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Members Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="border-b border-slate-200 dark:border-slate-700">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Assigned Members ({assignments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {assignments.length === 0 ? (
                <div className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No members assigned</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Use the form on the right to assign members to this shepherd
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                      <TableHead>Member</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead className="text-center">Follow-ups</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((assignment) => {
                      const stats = statsMap.get(assignment.memberId)
                      return (
                        <TableRow
                          key={assignment.assignmentId}
                          className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/30"
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">
                                {assignment.firstName} {assignment.lastName}
                              </p>
                              <p className="text-xs text-slate-500">
                                {assignment.memberNumber}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {assignment.phone && (
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {assignment.phone}
                                </p>
                              )}
                              {assignment.email && (
                                <p className="text-xs text-slate-500 truncate">
                                  {assignment.email}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center gap-2">
                              {stats?.overdue > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {stats.overdue} overdue
                                </Badge>
                              )}
                              {stats?.pending > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {stats.pending} pending
                                </Badge>
                              )}
                              {stats?.completed > 0 && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                >
                                  {stats.completed} done
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DeleteAssignmentButton
                              assignmentId={assignment.assignmentId}
                              memberName={`${assignment.firstName} ${assignment.lastName}`}
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Assign Member Form */}
        <div>
          <AssignMemberDialog
            shepherdId={shepherdId}
            unassignedMembers={unassignedMembers.map(m => ({
              ...m,
              email: m.email ?? undefined
            }))}
          />
        </div>
      </div>
    </div>
  )
}
