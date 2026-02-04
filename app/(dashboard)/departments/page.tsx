import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, Plus, Settings, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { db } from '@/lib/db'
import { departments, memberDepartments } from '@/lib/db/schema'
import { eq, asc, sql } from 'drizzle-orm'
import { NewDepartmentModal } from '@/components/modals'

async function getDepartmentsWithMembers() {
    const depts = await db.select().from(departments).where(eq(departments.isActive, true)).orderBy(asc(departments.name))

    // Get member counts for each department
    const withCounts = await Promise.all(depts.map(async (d) => {
        const [count] = await db
            .select({ count: sql<number>`count(*)` })
            .from(memberDepartments)
            .where(eq(memberDepartments.departmentId, d.id))
        return { ...d, memberCount: Number(count?.count || 0) }
    }))

    return withCounts
}

export default async function DepartmentsPage() {
    const deptList = await getDepartmentsWithMembers()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Departments</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage church departments and ministries</p>
                </div>
                <NewDepartmentModal />
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-slate-200 dark:border-slate-700">
                    <CardContent className="pt-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Active Departments</p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">{deptList.length}</p>
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
                                <p className="text-sm text-slate-500 dark:text-slate-400">Total Assignments</p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">{deptList.reduce((a, d) => a + d.memberCount, 0)}</p>
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
                                <p className="text-sm text-slate-500 dark:text-slate-400">With Leaders</p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">{deptList.filter(d => d.leaderId).length}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                                <Settings className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Departments Grid */}
            {deptList.length === 0 ? (
                <Card className="border-slate-200 dark:border-slate-700">
                    <CardContent className="py-16">
                        <div className="text-center text-slate-500 dark:text-slate-400">
                            <Building2 className="h-16 w-16 mx-auto mb-4 opacity-30" />
                            <p className="text-xl font-semibold">No departments yet</p>
                            <p className="text-sm mt-2">Create your first department to organize ministries</p>
                            <Link href="/departments/new">
                                <Button className="mt-6">
                                    <Plus className="h-4 w-4 mr-2" />Create First Department
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {deptList.map((dept) => (
                        <Link key={dept.id} href={`/departments/${dept.id}`}>
                            <Card className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors h-full group cursor-pointer">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                                                <Building2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base font-medium group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">{dept.name}</CardTitle>
                                                {dept.description && (
                                                    <CardDescription className="line-clamp-1 mt-0.5 text-sm">{dept.description}</CardDescription>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                            <Users className="h-4 w-4" />
                                            <span>{dept.memberCount} member{dept.memberCount !== 1 ? 's' : ''}</span>
                                        </div>
                                        <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                                            Active
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
