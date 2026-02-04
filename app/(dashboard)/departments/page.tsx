import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, Settings, ChevronRight, Plus, ArrowRight } from 'lucide-react'
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

  const totalMembers = deptList.reduce((sum, d) => sum + d.memberCount, 0)
  const withLeaders = deptList.filter(d => d.leaderId).length

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Departments</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2">Manage church departments and ministries</p>
        </div>
        <NewDepartmentModal />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Active Departments"
          value={deptList.length.toString()}
          subtitle="Ministry teams"
          icon={Building2}
          color="blue"
        />
        <StatCard
          title="Total Assignments"
          value={totalMembers.toString()}
          subtitle="Members assigned"
          icon={Users}
          color="green"
        />
        <StatCard
          title="With Leaders"
          value={withLeaders.toString()}
          subtitle="Departments"
          icon={Settings}
          color="purple"
        />
      </div>

      {/* Departments Grid */}
      {deptList.length === 0 ? (
        <Card className="border-slate-200 dark:border-slate-700">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 w-fit mx-auto mb-4">
                <Building2 className="h-12 w-12 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No departments yet</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Create your first department to organize your church ministries</p>
              <Link href="/departments/new">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
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
              <Card className="border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-200 h-full group cursor-pointer overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex-shrink-0 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors">
                        <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                          {dept.name}
                        </CardTitle>
                        {dept.description && (
                          <CardDescription className="line-clamp-2 mt-1 text-xs">
                            {dept.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium">{dept.memberCount} member{dept.memberCount !== 1 ? 's' : ''}</span>
                    </div>
                    <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                      Active
                    </Badge>
                  </div>
                  {dept.leaderId && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700">
                      <div className="p-1 rounded bg-indigo-50 dark:bg-indigo-900/20">
                        <Settings className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span>Has assigned leader</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Department Tips Card */}
      {deptList.length > 0 && (
        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex-shrink-0">
                <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 dark:text-white">Department Management Tips</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                  Assign leaders to departments to improve organization and accountability. Keep your departments updated with current member assignments.
                </p>
                <Link href="/reports/members">
                  <Button variant="outline" size="sm" className="mt-3 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                    View Member Directory <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue'
}: {
  title: string
  value: string
  subtitle: string
  icon: React.ElementType
  color?: 'blue' | 'green' | 'purple'

}) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      icon: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      accent: 'from-blue-50 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-900/20'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      icon: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
      accent: 'from-green-50 to-green-100/50 dark:from-green-900/10 dark:to-green-900/20'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      icon: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
      accent: 'from-purple-50 to-purple-100/50 dark:from-purple-900/10 dark:to-purple-900/20'
    }
  }

  const colors = colorClasses[color]

  return (
    <Card className="border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all group overflow-hidden">
      <div className={`inset-0 bg-gradient-to-r ${colors.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
      <CardContent className="pt-6 relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-lg border ${colors.border} ${colors.bg}`}>
            <Icon className={`h-5 w-5 ${colors.icon}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
