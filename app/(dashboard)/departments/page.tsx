import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, Plus } from 'lucide-react'
import Link from 'next/link'
import { db } from '@/lib/db'
import { departments } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

async function getDepartments() {
    return db
        .select()
        .from(departments)
        .where(eq(departments.isActive, true))
        .orderBy(asc(departments.name))
}

export default async function DepartmentsPage() {
    const deptList = await getDepartments()

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Departments</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Manage church departments and ministries
                    </p>
                </div>
                <Link href="/departments/new">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Department
                    </Button>
                </Link>
            </div>

            {/* Departments Grid */}
            {deptList.length === 0 ? (
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardContent className="py-12">
                        <div className="text-center text-slate-500 dark:text-slate-400">
                            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No departments yet</p>
                            <p className="text-sm mt-1">Create your first department to organize ministries</p>
                            <Link href="/departments/new">
                                <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create First Department
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {deptList.map((dept) => (
                        <Link key={dept.id} href={`/departments/${dept.id}`}>
                            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow h-full">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                                <Building2 className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{dept.name}</CardTitle>
                                                {dept.description && (
                                                    <CardDescription className="line-clamp-2 mt-1">
                                                        {dept.description}
                                                    </CardDescription>
                                                )}
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                            Active
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                        <Users className="h-4 w-4" />
                                        <span>0 members</span>
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
