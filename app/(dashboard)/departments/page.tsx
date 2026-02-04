import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, Plus, Settings, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { db } from '@/lib/db'
import { departments, memberDepartments } from '@/lib/db/schema'
import { eq, asc, sql } from 'drizzle-orm'

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

const departmentColors = [
    'from-blue-500 to-indigo-600',
    'from-green-500 to-emerald-600',
    'from-violet-500 to-purple-600',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-600',
    'from-cyan-500 to-blue-500',
    'from-teal-500 to-green-600',
    'from-fuchsia-500 to-pink-500',
]

export default async function DepartmentsPage() {
    const deptList = await getDepartmentsWithMembers()

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">Departments</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage church departments and ministries</p>
                </div>
                <Link href="/departments/new">
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25">
                        <Plus className="h-4 w-4 mr-2" />Add Department
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-xl shadow-blue-500/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-white/20">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold">{deptList.length}</p>
                                <p className="text-blue-100">Active Departments</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-xl shadow-green-500/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-white/20">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold">{deptList.reduce((a, d) => a + d.memberCount, 0)}</p>
                                <p className="text-green-100">Total Assignments</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-0 shadow-xl shadow-violet-500/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-white/20">
                                <Settings className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold">{deptList.filter(d => d.leaderId).length}</p>
                                <p className="text-violet-100">With Leaders</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Departments Grid */}
            {deptList.length === 0 ? (
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                    <CardContent className="py-16">
                        <div className="text-center text-slate-500 dark:text-slate-400">
                            <Building2 className="h-16 w-16 mx-auto mb-4 opacity-30" />
                            <p className="text-xl font-semibold">No departments yet</p>
                            <p className="text-sm mt-2">Create your first department to organize ministries</p>
                            <Link href="/departments/new">
                                <Button className="mt-6 bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" />Create First Department
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {deptList.map((dept, i) => (
                        <Link key={dept.id} href={`/departments/${dept.id}`}>
                            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full group cursor-pointer overflow-hidden">
                                <div className={`h-2 bg-gradient-to-r ${departmentColors[i % departmentColors.length]}`} />
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-xl bg-gradient-to-br ${departmentColors[i % departmentColors.length]} text-white`}>
                                                <Building2 className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">{dept.name}</CardTitle>
                                                {dept.description && (
                                                    <CardDescription className="line-clamp-2 mt-1">{dept.description}</CardDescription>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                            <Users className="h-4 w-4" />
                                            <span>{dept.memberCount} member{dept.memberCount !== 1 ? 's' : ''}</span>
                                        </div>
                                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
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
