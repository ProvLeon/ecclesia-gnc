import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Building2, Users, ArrowLeft, Mail, Phone, Calendar, Edit, UserPlus } from 'lucide-react'
import { db } from '@/lib/db'
import { departments, memberDepartments, members } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

interface PageProps {
    params: Promise<{ id: string }>
}

async function getDepartment(id: string) {
    const [dept] = await db.select().from(departments).where(eq(departments.id, id)).limit(1)
    return dept
}

async function getDepartmentMembers(deptId: string) {
    const result = await db
        .select({
            id: members.id,
            firstName: members.firstName,
            lastName: members.lastName,
            email: members.email,
            phone: members.phonePrimary,
            role: memberDepartments.role,
            joinedAt: memberDepartments.createdAt,
        })
        .from(memberDepartments)
        .innerJoin(members, eq(memberDepartments.memberId, members.id))
        .where(eq(memberDepartments.departmentId, deptId))
    return result
}

export default async function DepartmentDetailPage({ params }: PageProps) {
    const { id } = await params
    const [dept, deptMembers] = await Promise.all([
        getDepartment(id),
        getDepartmentMembers(id),
    ])

    if (!dept) {
        notFound()
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <Link href="/departments">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700">
                            <Building2 className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{dept.name}</h1>
                            <p className="text-slate-500 dark:text-slate-400">{dept.description || 'No description'}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <UserPlus className="h-4 w-4 mr-2" />Add Member
                    </Button>
                    <Button variant="outline">
                        <Edit className="h-4 w-4 mr-2" />Edit
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-slate-200 dark:border-slate-700">
                    <CardContent className="pt-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Members</p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">{deptMembers.length}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                                <Users className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-700">
                    <CardContent className="pt-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
                                <Badge className="mt-2 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400">
                                    {dept.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                                <Building2 className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-700">
                    <CardContent className="pt-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Created</p>
                                <p className="text-sm font-medium text-slate-900 dark:text-white mt-2">
                                    {dept.createdAt ? new Date(dept.createdAt).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                                <Calendar className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Members List */}
            <Card className="border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                            <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-medium">Department Members</CardTitle>
                            <CardDescription>{deptMembers.length} member{deptMembers.length !== 1 ? 's' : ''}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    {deptMembers.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                            <p className="font-medium">No members yet</p>
                            <p className="text-sm mt-1">Add members to this department</p>
                            <Button className="mt-4" size="sm">
                                <UserPlus className="h-4 w-4 mr-2" />Add First Member
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {deptMembers.map((m) => (
                                <Link
                                    key={m.id}
                                    href={`/members/${m.id}`}
                                    className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                                {m.firstName?.[0]}{m.lastName?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm text-slate-900 dark:text-white">
                                                {m.firstName} {m.lastName}
                                            </p>
                                            {m.role && (
                                                <Badge variant="outline" className="text-xs mt-0.5">{m.role}</Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-slate-500">
                                        {m.phone && (
                                            <a href={`tel:${m.phone}`} className="hover:text-slate-700" onClick={(e) => e.stopPropagation()}>
                                                <Phone className="h-4 w-4" />
                                            </a>
                                        )}
                                        {m.email && (
                                            <a href={`mailto:${m.email}`} className="hover:text-slate-700" onClick={(e) => e.stopPropagation()}>
                                                <Mail className="h-4 w-4" />
                                            </a>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
