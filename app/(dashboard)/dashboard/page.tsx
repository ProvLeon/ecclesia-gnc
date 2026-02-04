import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Wallet, CalendarCheck, TrendingUp, Heart, Building2, MessageSquare, ArrowRight, Activity, Zap, Target } from 'lucide-react'
import Link from 'next/link'
import { db } from '@/lib/db'
import { members, tithes, services, attendance, followUps } from '@/lib/db/schema'
import { eq, sql, gte, desc } from 'drizzle-orm'

async function getDashboardStats() {
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  const lastSunday = new Date(today)
  lastSunday.setDate(today.getDate() - today.getDay())
  const lastSundayStr = lastSunday.toISOString().split('T')[0]

  const [totalMembers] = await db.select({ count: sql<number>`count(*)` }).from(members).where(eq(members.memberStatus, 'active'))
  const [monthTithes] = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` }).from(tithes).where(gte(tithes.paymentDate, startOfMonth))

  const [lastService] = await db.select({ id: services.id }).from(services).where(eq(services.serviceDate, lastSundayStr)).limit(1)
  let sundayAttendance = 0
  if (lastService) {
    const [att] = await db.select({ count: sql<number>`count(*)` }).from(attendance).where(eq(attendance.serviceId, lastService.id))
    sundayAttendance = Number(att?.count || 0)
  }

  const [newMembers] = await db.select({ count: sql<number>`count(*)` }).from(members).where(gte(members.joinDate, startOfMonth))
  const [pendingFollowups] = await db.select({ count: sql<number>`count(*)` }).from(followUps).where(eq(followUps.status, 'pending'))

  return {
    totalMembers: Number(totalMembers?.count || 0),
    monthTithes: Number(monthTithes?.total || 0),
    sundayAttendance,
    newMembers: Number(newMembers?.count || 0),
    pendingFollowups: Number(pendingFollowups?.count || 0),
  }
}

async function getRecentMembers() {
  return db
    .select({
      id: members.id,
      name: sql<string>`concat(${members.firstName}, ' ', ${members.lastName})`,
      joinDate: members.joinDate,
    })
    .from(members)
    .orderBy(desc(members.createdAt))
    .limit(5)
}

export default async function DashboardPage() {
  const [stats, recentMembers] = await Promise.all([
    getDashboardStats(),
    getRecentMembers(),
  ])

  return (
    <main className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">Welcome back to Ecclesia — GNC AG Ejisu</p>
      </div>

      {/* Primary Stats Grid - Responsive 1, 2, or 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Members"
          value={stats.totalMembers.toLocaleString()}
          subtitle="Active members"
          icon={Users}
          trend="up"
          href="/members"
        />
        <StatCard
          title="This Month's Tithes"
          value={`GH₵ ${stats.monthTithes.toLocaleString()}`}
          subtitle="Financial support"
          icon={Wallet}
          trend="stable"
          href="/finance"
        />
        <StatCard
          title="Last Sunday"
          value={stats.sundayAttendance.toString()}
          subtitle="Attendance"
          icon={CalendarCheck}
          trend="stable"
          href="/attendance"
        />
        <StatCard
          title="New Members"
          value={stats.newMembers.toString()}
          subtitle="This month"
          icon={TrendingUp}
          trend={stats.newMembers > 0 ? "up" : "stable"}
          href="/members"
        />
      </div>

      {/* Main Content Grid - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10 dark:bg-accent/20">
                <Zap className="h-5 w-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
                <CardDescription className="text-xs">Common tasks</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2 pt-4">
            <QuickAction icon={Users} label="Add Member" href="/members/new" />
            <QuickAction icon={Wallet} label="Record Tithe" href="/finance/tithe/new" />
            <QuickAction icon={CalendarCheck} label="New Service" href="/attendance/new" />
            <QuickAction icon={MessageSquare} label="Send SMS" href="/messages/compose" />
            <QuickAction icon={Heart} label="Schedule Visit" href="/shepherding/new" />
            <QuickAction icon={Building2} label="Departments" href="/departments" />
          </CardContent>
        </Card>

        {/* Recent Members */}
        <Card className="lg:col-span-2 border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 dark:border-slate-700 gap-3">
            <div>
              <CardTitle className="text-base font-semibold">Recent Members</CardTitle>
              <CardDescription className="text-xs">Latest additions to the congregation</CardDescription>
            </div>
            <Link href="/members" className="w-full sm:w-auto">
              <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 w-full sm:w-auto">
                View All <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            {recentMembers.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Users className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">No members yet</p>
                <p className="text-xs mt-1">Start adding members to your congregation</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentMembers.map((m) => (
                  <Link
                    key={m.id}
                    href={`/members/${m.id}`}
                    className="flex items-center gap-3 p-3 -mx-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 dark:from-primary/30 dark:to-accent/30 flex items-center justify-center text-primary dark:text-accent text-sm font-semibold flex-shrink-0">
                      {m.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{m.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Joined {m.joinDate}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-primary dark:group-hover:text-accent group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Follow-ups Alert */}
      {stats.pendingFollowups > 0 && (
        <Card className="border-l-4 border-l-accent border-slate-200 dark:border-slate-700 bg-gradient-to-r from-accent/5 to-transparent dark:from-accent/10 dark:to-transparent shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-5 gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-accent/10 dark:bg-accent/20 flex-shrink-0">
                <Heart className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {stats.pendingFollowups} Scheduled Follow-up{stats.pendingFollowups !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">Members awaiting pastoral care</p>
              </div>
            </div>
            <Link href="/shepherding" className="w-full sm:w-auto">
              <Button className="bg-primary hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 dark:text-primary text-white w-full sm:w-auto">
                Review <Target className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Insights Card */}
      <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10 dark:bg-primary/20 flex-shrink-0">
              <Activity className="h-5 w-5 text-primary dark:text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 dark:text-white">Dashboard Insights</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                Your congregation is growing with <span className="font-semibold text-primary dark:text-accent">{stats.newMembers} new member{stats.newMembers !== 1 ? 's' : ''}</span> this month and an average of <span className="font-semibold text-primary dark:text-accent">{stats.sundayAttendance}</span> attendees per service.
              </p>
              <Link href="/reports/analytics" className="inline-block mt-4">
                <Button variant="outline" size="sm" className="border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700">
                  View Analytics <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

function StatCard({ title, value, subtitle, icon: Icon, trend = "stable", href }: {
  title: string
  value: string
  subtitle: string
  icon: React.ElementType
  trend?: "up" | "down" | "stable"
  href: string
}) {
  const trendStyles = {
    up: {
      bg: 'bg-accent/10 dark:bg-accent/20',
      icon: 'text-accent',
    },
    down: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      icon: 'text-red-600 dark:text-red-400',
    },
    stable: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      icon: 'text-slate-600 dark:text-slate-400',
    }
  }

  const style = trendStyles[trend]

  return (
    <Link href={href}>
      <Card className="border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 cursor-pointer overflow-hidden h-full">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent opacity-0 hover:opacity-100 transition-opacity" />
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2 break-words">{value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
            </div>
            <div className={`p-3 rounded-lg ${style.bg} flex-shrink-0`}>
              <Icon className={`h-5 w-5 ${style.icon}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function QuickAction({ icon: Icon, label, href }: { icon: React.ElementType; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary/30 dark:hover:border-accent/30 hover:bg-primary/5 dark:hover:bg-accent/5 transition-all duration-200 group cursor-pointer h-full"
    >
      <div className="p-2 rounded-md bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/20 dark:group-hover:bg-accent/20 transition-colors">
        <Icon className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-primary dark:group-hover:text-accent transition-colors" />
      </div>
      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary dark:group-hover:text-accent text-center line-clamp-2">{label}</span>
    </Link>
  )
}
