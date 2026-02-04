import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    PlusCircle,
    Users,
    UserPlus,
    ArrowLeft
} from 'lucide-react'
import { db } from '@/lib/db'
import { shepherds, shepherdAssignments, members } from '@/lib/db/schema'
import { eq, desc, sql, count } from 'drizzle-orm'
import { AssignmentActions } from './assignment-actions'

async function getShepherdsWithAssignments() {
    return db
        .select({
            id: shepherds.id,
            memberId: shepherds.memberId,
            isActive: shepherds.isActive,
            assignedDate: shepherds.assignedDate,
            firstName: members.firstName,
            lastName: members.lastName,
            phone: members.phonePrimary,
            assignmentCount: sql<number>`(
                SELECT count(*) FROM shepherd_assignments 
                WHERE shepherd_id = ${shepherds.id} AND is_active = true
            )`,
        })
        .from(shepherds)
        .innerJoin(members, eq(shepherds.memberId, members.id))
        .where(eq(shepherds.isActive, true))
        .orderBy(members.firstName)
}

async function getUnassignedMembers() {
    return db
        .select({
            id: members.id,
            firstName: members.firstName,
            lastName: members.lastName,
            phone: members.phonePrimary,
        })
        .from(members)
        .where(sql`${members.id} NOT IN (
            SELECT member_id FROM shepherd_assignments WHERE is_active = true
        ) AND ${members.memberStatus} = 'active'`)
        .orderBy(members.firstName)
        .limit(100)
}

async function getAssignmentStats() {
    const [stats] = await db
        .select({
            totalShepherds: sql<number>`(SELECT count(*) FROM shepherds WHERE is_active = true)`,
            totalAssigned: sql<number>`(SELECT count(DISTINCT member_id) FROM shepherd_assignments WHERE is_active = true)`,
            totalMembers: sql<number>`(SELECT count(*) FROM members WHERE member_status = 'active')`,
        })
        .from(shepherds)
        .limit(1)

    return {
        totalShepherds: Number(stats?.totalShepherds || 0),
        totalAssigned: Number(stats?.totalAssigned || 0),
        totalMembers: Number(stats?.totalMembers || 0),
        unassigned: Number(stats?.totalMembers || 0) - Number(stats?.totalAssigned || 0),
    }
}

export default async function ShepherdAssignmentsPage() {
    const [shepherdList, unassignedMembers, stats] = await Promise.all([
        getShepherdsWithAssignments(),
        getUnassignedMembers(),
        getAssignmentStats(),
    ])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <Link href="/shepherding">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Shepherd Assignments
                        </h1>
                        <p className="text-sm text-slate-500">
                            Manage member assignments to shepherds
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                            <Users className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.totalShepherds}</p>
                            <p className="text-xs text-slate-500">Shepherds</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                            <UserPlus className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.totalAssigned}</p>
                            <p className="text-xs text-slate-500">Assigned</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                            <Users className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.unassigned}</p>
                            <p className="text-xs text-slate-500">Unassigned</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                            <Users className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.totalMembers}</p>
                            <p className="text-xs text-slate-500">Total Members</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Shepherds and Assignments */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Shepherd List */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Shepherds
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 divide-y divide-slate-200 dark:divide-slate-700">
                            {shepherdList.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    No shepherds found
                                </div>
                            ) : (
                                shepherdList.map((shepherd) => (
                                    <div key={shepherd.id} className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback>
                                                    {shepherd.firstName[0]}{shepherd.lastName[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">
                                                    {shepherd.firstName} {shepherd.lastName}
                                                </p>
                                                <p className="text-sm text-slate-500">{shepherd.phone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge className="bg-indigo-100 text-indigo-700">
                                                {shepherd.assignmentCount} members
                                            </Badge>
                                            <Link href={`/shepherding/assignments/${shepherd.id}`}>
                                                <Button variant="outline" size="sm">
                                                    Manage
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Unassigned Members */}
                <div>
                    <Card>
                        <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Unassigned ({unassignedMembers.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 divide-y divide-slate-200 dark:divide-slate-700 max-h-96 overflow-y-auto">
                            {unassignedMembers.length === 0 ? (
                                <div className="p-4 text-center text-sm text-slate-500">
                                    All members are assigned!
                                </div>
                            ) : (
                                unassignedMembers.map((member) => (
                                    <div key={member.id} className="p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="text-xs">
                                                    {member.firstName[0]}{member.lastName[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{member.firstName} {member.lastName}</span>
                                        </div>
                                        <AssignmentActions
                                            memberId={member.id}
                                            memberName={`${member.firstName} ${member.lastName}`}
                                            shepherds={shepherdList}
                                        />
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
