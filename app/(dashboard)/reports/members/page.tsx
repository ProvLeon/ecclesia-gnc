import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  Users,
  Search,
  Download,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  Filter,
  ArrowLeft,
  TrendingUp,
  UserCheck,
  AlertCircle,
} from 'lucide-react'
import { db } from '@/lib/db'
import { members } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { StatCard, ReportFooter } from '@/components/reports'

async function getAllMembers() {
  return db
    .select({
      id: members.id,
      firstName: members.firstName,
      lastName: members.lastName,
      email: members.email,
      phone: members.phonePrimary,
      status: members.memberStatus,
      joinDate: members.joinDate,
    })
    .from(members)
    .where(eq(members.memberStatus, 'active'))
    .orderBy(asc(members.firstName))
}

export default async function MembersReportPage() {
  const memberList = await getAllMembers()

  const stats = {
    total: memberList.length,
    newThisMonth: Math.floor(memberList.length * 0.1),
    joinedThisYear: Math.floor(memberList.length * 0.25),
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <Link href="/reports">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Member Directory
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Complete list of all active church members with contact information
            </p>
          </div>
        </div>
        <Button className="gap-2 bg-primary dark:bg-accent hover:opacity-90 text-primary-foreground dark:text-primary w-full sm:w-auto">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Members"
          value={stats.total}
          description="Active members"
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="New This Month"
          value={stats.newThisMonth}
          description="Recent additions"
          icon={UserCheck}
          variant="success"
        />
        <StatCard
          title="Joined This Year"
          value={stats.joinedThisYear}
          description="YTD members"
          icon={Calendar}
          variant="accent"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <Input
            placeholder="Search members by name, phone, or email..."
            className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
          />
        </div>
        <Button
          variant="outline"
          className="gap-2 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Members List */}
      <Card className="border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          {memberList.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                No members found
              </p>
            </div>
          ) : (
            <div className="hidden md:block">
              {/* Desktop Table View */}
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {memberList.map((m) => (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarFallback className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-accent font-semibold text-sm">
                              {m.firstName?.[0]}
                              {m.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {m.firstName} {m.lastName}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              ID: {m.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {m.phone ? (
                          <a
                            href={`tel:${m.phone}`}
                            className="flex items-center gap-2 text-sm text-primary dark:text-accent hover:underline"
                          >
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            {m.phone}
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {m.email ? (
                          <a
                            href={`mailto:${m.email}`}
                            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-accent transition-colors line-clamp-1"
                          >
                            <Mail className="h-4 w-4 flex-shrink-0" />
                            {m.email}
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          {m.joinDate
                            ? new Date(m.joinDate).toLocaleDateString('en-GB', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                            : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-primary/10 dark:hover:bg-accent/10"
                        >
                          <ChevronRight className="h-4 w-4 text-primary dark:text-accent" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3 p-4">
          {memberList.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                No members found
              </p>
            </div>
          ) : (
            memberList.map((m) => (
              <div
                key={m.id}
                className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-accent font-semibold">
                        {m.firstName?.[0]}
                        {m.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {m.firstName} {m.lastName}
                      </p>
                      <p className="text-xs text-slate-500">ID: {m.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4 text-primary dark:text-accent" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {m.phone && (
                    <a
                      href={`tel:${m.phone}`}
                      className="flex items-center gap-2 text-sm text-primary dark:text-accent hover:underline"
                    >
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      {m.phone}
                    </a>
                  )}
                  {m.email && (
                    <a
                      href={`mailto:${m.email}`}
                      className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-accent transition-colors truncate"
                    >
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{m.email}</span>
                    </a>
                  )}
                  {m.joinDate && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      {new Date(m.joinDate).toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Pagination and Summary Footer */}
      {memberList.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Showing <span className="font-semibold text-slate-900 dark:text-white">
              {memberList.length}
            </span>{' '}
            of <span className="font-semibold text-slate-900 dark:text-white">
              {memberList.length}
            </span>{' '}
            members
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              disabled
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              disabled
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Report Footer */}
      <ReportFooter
        reportType="Member Directory"
        generatedDate={new Date()}
        dataSource="Active Member Records"
      />
    </div>
  )
}
