import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, Clock, CheckCircle, AlertTriangle, Plus, Phone, Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getShepherdingStats, getFollowUps } from '@/app/actions/shepherding'
import { format } from 'date-fns'

export default async function ShepherdingPage() {
    const [stats, { data: scheduledFollowUps }, { data: completedFollowUps }] = await Promise.all([
        getShepherdingStats(),
        getFollowUps('scheduled', 1, 10),
        getFollowUps('completed', 1, 5),
    ])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Shepherding</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Pastoral care and member follow-ups</p>
                </div>
                <Link href="/shepherding/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />Schedule Follow-up
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Scheduled"
                    value={stats.pending.toString()}
                    subtitle="Awaiting visits"
                    icon={Clock}
                />
                <StatCard
                    title="Completed This Month"
                    value={stats.completedThisMonth.toString()}
                    subtitle="Successful visits"
                    icon={CheckCircle}
                />
                <StatCard
                    title="Overdue"
                    value={stats.overdue.toString()}
                    subtitle="Needs attention"
                    icon={AlertTriangle}
                    alert={stats.overdue > 0}
                />
            </div>

            {/* Scheduled Follow-ups */}
            <Card className="border-slate-200 dark:border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                            <Heart className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-medium">Scheduled Follow-ups</CardTitle>
                            <CardDescription>Members awaiting pastoral contact</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    {scheduledFollowUps.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <Heart className="h-10 w-10 mx-auto mb-3 opacity-50" />
                            <p className="font-medium">No scheduled follow-ups</p>
                            <p className="text-sm mt-1">All caught up! 🎉</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {scheduledFollowUps.map((f) => {
                                const isOverdue = f.scheduledDate ? new Date(f.scheduledDate) < new Date() : false
                                return (
                                    <div
                                        key={f.id}
                                        className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 text-sm font-medium">
                                                {f.memberName?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-slate-900 dark:text-white">{f.memberName}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Badge variant="outline" className="text-xs py-0 h-5 capitalize">{f.type}</Badge>
                                                    <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-amber-600' : 'text-slate-500'}`}>
                                                        <Calendar className="h-3 w-3" />
                                                        {f.scheduledDate ? format(new Date(f.scheduledDate), 'MMM d') : '-'}
                                                        {isOverdue && <AlertTriangle className="h-3 w-3 ml-0.5" />}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {f.memberPhone && (
                                                <a href={`tel:${f.memberPhone}`} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 hover:text-slate-700">
                                                    <Phone className="h-4 w-4" />
                                                </a>
                                            )}
                                            <Link href={`/shepherding/${f.id}/complete`}>
                                                <Button size="sm" variant="outline">
                                                    <CheckCircle className="h-4 w-4 mr-1" />Complete
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

            {/* Recently Completed */}
            {completedFollowUps.length > 0 && (
                <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <CardTitle className="text-base font-medium">Recently Completed</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="space-y-2">
                            {completedFollowUps.map((f) => (
                                <div key={f.id} className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-lg">
                                    <div>
                                        <p className="font-medium text-sm text-slate-900 dark:text-white">{f.memberName}</p>
                                        <p className="text-xs text-slate-500 capitalize">{f.type} • {f.completedDate && format(new Date(f.completedDate), 'MMM d')}</p>
                                    </div>
                                    <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">Done</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

function StatCard({ title, value, subtitle, icon: Icon, alert = false }: {
    title: string
    value: string
    subtitle: string
    icon: React.ElementType
    alert?: boolean
}) {
    return (
        <Card className={`border-slate-200 dark:border-slate-700 ${alert ? 'border-l-2 border-l-amber-500' : ''}`}>
            <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
                        <p className={`text-2xl font-semibold mt-1 ${alert ? 'text-amber-600' : 'text-slate-900 dark:text-white'}`}>{value}</p>
                        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${alert ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                        <Icon className={`h-5 w-5 ${alert ? 'text-amber-600' : 'text-slate-500 dark:text-slate-400'}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
