import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, ArrowLeft, Download, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { getShepherdingStats, getFollowUps } from '@/app/actions/shepherding'
import { format } from 'date-fns'

export default async function ShepherdingReportPage() {
    const [stats, { data: scheduled }, { data: completed }] = await Promise.all([
        getShepherdingStats(),
        getFollowUps('scheduled', 1, 10),
        getFollowUps('completed', 1, 10),
    ])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <Link href="/reports">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Pastoral Care Report</h1>
                        <p className="text-slate-500 dark:text-slate-400">Follow-up activity summary</p>
                    </div>
                </div>
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />Export PDF
                </Button>
            </div>

            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-slate-200 dark:border-slate-700">
                    <CardContent className="pt-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Scheduled</p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">{stats.pending}</p>
                                <p className="text-xs text-slate-400 mt-1">Awaiting visits</p>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                                <Clock className="h-5 w-5 text-slate-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-700">
                    <CardContent className="pt-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Completed This Month</p>
                                <p className="text-2xl font-semibold text-green-600 mt-1">{stats.completedThisMonth}</p>
                                <p className="text-xs text-slate-400 mt-1">Successful visits</p>
                            </div>
                            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/30">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className={`border-slate-200 dark:border-slate-700 ${stats.overdue > 0 ? 'border-l-2 border-l-amber-500' : ''}`}>
                    <CardContent className="pt-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Overdue</p>
                                <p className={`text-2xl font-semibold mt-1 ${stats.overdue > 0 ? 'text-amber-600' : 'text-slate-900 dark:text-white'}`}>
                                    {stats.overdue}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">Needs attention</p>
                            </div>
                            <div className={`p-2 rounded-lg ${stats.overdue > 0 ? 'bg-amber-50 dark:bg-amber-900/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                <AlertTriangle className={`h-5 w-5 ${stats.overdue > 0 ? 'text-amber-600' : 'text-slate-500'}`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Lists */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Scheduled */}
                <Card className="border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                                <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <CardTitle className="text-base font-medium">Scheduled Follow-ups</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {scheduled.length === 0 ? (
                            <p className="text-center text-slate-400 py-6">No scheduled follow-ups</p>
                        ) : (
                            <div className="space-y-2">
                                {scheduled.map((f) => (
                                    <div key={f.id} className="flex justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{f.memberName}</p>
                                            <p className="text-xs text-slate-500 capitalize">{f.type}</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">{format(new Date(f.scheduledDate), 'MMM d')}</Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Completed */}
                <Card className="border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/30">
                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <CardTitle className="text-base font-medium">Recently Completed</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {completed.length === 0 ? (
                            <p className="text-center text-slate-400 py-6">No completed follow-ups yet</p>
                        ) : (
                            <div className="space-y-2">
                                {completed.map((f) => (
                                    <div key={f.id} className="flex justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{f.memberName}</p>
                                            <p className="text-xs text-slate-500 capitalize">{f.type}</p>
                                        </div>
                                        <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">Done</Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
