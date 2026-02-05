import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, Clock, CheckCircle, AlertTriangle, Phone, Calendar, ArrowRight, Users, Zap } from 'lucide-react'
import Link from 'next/link'
import { getShepherdingStats, getFollowUps } from '@/app/actions/shepherding'
import { format } from 'date-fns'
import { NewFollowUpModal } from '@/components/modals'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ShepherdingPage() {
  const [stats, { data: scheduledFollowUps }, { data: completedFollowUps }] = await Promise.all([
    getShepherdingStats(),
    getFollowUps('pending', 1, 10),
    getFollowUps('completed', 1, 5),
  ])

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Shepherd Follow-ups</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2">Manage pastoral care assignments and member follow-ups</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/shepherding/assignments">
            <Button variant="outline" className="border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
              <Users className="h-4 w-4 mr-2" />
              Assignments
            </Button>
          </Link>
          <NewFollowUpModal />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Scheduled"
          value={stats.pending.toString()}
          subtitle="Awaiting visits"
          icon={Clock}
          color="blue"
          trend="up"
        />
        <StatCard
          title="Completed This Month"
          value={stats.completedThisMonth.toString()}
          subtitle="Successful visits"
          icon={CheckCircle}
          color="green"
          trend="up"
        />
        <StatCard
          title="Overdue"
          value={stats.overdue.toString()}
          subtitle="Needs attention"
          icon={AlertTriangle}
          color="red"
          alert={stats.overdue > 0}
          trend="down"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Scheduled Follow-ups */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm h-full">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                    <Heart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">Scheduled Follow-ups</CardTitle>
                    <CardDescription className="text-xs mt-1">Shepherd assignments awaiting pastoral contact</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {scheduledFollowUps.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                  <p className="font-medium text-slate-900 dark:text-white">No scheduled follow-ups</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">All caught up!</p>
                </div>
              ) : (
                <div className="space-y-2 pt-4">
                  {scheduledFollowUps.map((f) => {
                    const isOverdue = f.scheduledDate ? new Date(f.scheduledDate) < new Date() : false
                    return (
                      <div
                        key={f.id}
                        className="flex items-center justify-between p-4 -mx-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-sm font-semibold shrink-0">
                            {f.memberName?.charAt(0) || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-slate-900 dark:text-white">{f.memberName}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge variant="outline" className="text-xs py-0 h-5 capitalize border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                                {f.type}
                              </Badge>
                              <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                                <Calendar className="h-3 w-3" />
                                {f.scheduledDate ? format(new Date(f.scheduledDate), 'MMM d') : '-'}
                                {isOverdue && <AlertTriangle className="h-3 w-3 ml-0.5" />}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                          {f.memberPhone && (
                            <a href={`tel:${f.memberPhone}`} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors" title="Call member">
                              <Phone className="h-4 w-4" />
                            </a>
                          )}
                          <Link href={`/shepherding/${f.id}/complete`}>
                            <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-4">
          {/* Quick Stats */}
          <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 shadow-sm">
            <CardContent className="pt-5 pb-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex-shrink-0">
                    <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Pastoral Care Goals</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-semibold mt-1">
                      {stats.completedThisMonth} visits completed
                    </p>
                  </div>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <p>• Aim for monthly follow-ups with all members</p>
                  <p>• Priority: overdue visits</p>
                  <p>• Document all interactions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Create New Follow-up Card */}
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="pt-5 pb-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900 dark:text-white">Schedule New Follow-up</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Keep track of pastoral visits and member care activities
                </p>
                <NewFollowUpModal
                  trigger={
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                      <Heart className="h-4 w-4 mr-2" />
                      Schedule Visit
                    </Button>
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recently Completed Section */}
      {completedFollowUps.length > 0 && (
        <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Recently Completed</CardTitle>
                <CardDescription className="text-xs mt-1">Pastoral visits from this month</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {completedFollowUps.map((f) => (
                <div key={f.id} className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30">
                  <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-700 dark:text-green-400 text-sm font-semibold flex-shrink-0">
                    {f.memberName?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-900 dark:text-white truncate">{f.memberName}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {f.type} • {f.completedDate && format(new Date(f.completedDate), 'MMM d')}
                    </p>
                  </div>
                  <Badge className="bg-green-200 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-0 text-xs flex-shrink-0">
                    Done
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pastoral Care Tips */}
      <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/10 dark:to-transparent shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
              <Heart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 dark:text-white">Pastoral Care Best Practices</p>
              <ul className="text-sm text-slate-600 dark:text-slate-300 mt-2 space-y-1">
                <li>• Schedule regular follow-ups with each member</li>
                <li>• Document all visits and important information</li>
                <li>• Prioritize members facing challenges or transitions</li>
                <li>• Celebrate milestones and prayer answered</li>
              </ul>
              <Link href="/shepherding/assignments">
                <Button variant="outline" size="sm" className="mt-3 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  View Assignments <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  alert = false,
  trend = 'stable'
}: {
  title: string
  value: string
  subtitle: string
  icon: React.ElementType
  color?: 'blue' | 'green' | 'red'
  alert?: boolean
  trend?: 'up' | 'down' | 'stable'
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
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      icon: 'text-red-600 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
      accent: 'from-red-50 to-red-100/50 dark:from-red-900/10 dark:to-red-900/20'
    }
  }

  const colors = colorClasses[color]
  const leftBorderColor = alert ? 'border-l-red-500' : 'border-l-transparent'

  return (
    <Card className={`border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all group overflow-hidden border-l-4 ${leftBorderColor}`}>
      <div className={`inset-0 bg-gradient-to-r ${colors.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
      <CardContent className="pt-6 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{title}</p>
            <p className={`text-3xl font-bold mt-2 ${alert ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
              {value}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-lg border ${colors.border} ${colors.bg} flex-shrink-0`}>
            <Icon className={`h-5 w-5 ${colors.icon}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
