import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, FileText, Download, Users, Wallet, CalendarCheck } from 'lucide-react'
import Link from 'next/link'

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Generate and download detailed reports</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                <Users className="h-6 w-6" />
                            </div>
                            <CardTitle>Membership</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <ReportLink label="Member Directory" href="/reports/members" />
                        <ReportLink label="New Members" href="/reports/members/new" />
                        <ReportLink label="Birthdays" href="/reports/members/birthdays" />
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                                <Wallet className="h-6 w-6" />
                            </div>
                            <CardTitle>Financial</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <ReportLink label="Monthly Summary" href="/reports/finance" />
                        <ReportLink label="Tithe Report" href="/reports/finance/tithes" />
                        <ReportLink label="Expenses" href="/reports/finance/expenses" />
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                                <CalendarCheck className="h-6 w-6" />
                            </div>
                            <CardTitle>Attendance</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <ReportLink label="Weekly Report" href="/reports/attendance" />
                        <ReportLink label="Trends" href="/reports/attendance/trends" />
                        <ReportLink label="Absentees" href="/reports/attendance/absentees" />
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5 text-slate-400" />
                        Quick Export
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />All Members (CSV)
                        </Button>
                        <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />Tithes (CSV)
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function ReportLink({ label, href }: { label: string; href: string }) {
    return (
        <Link href={href} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
            <BarChart3 className="h-4 w-4 text-slate-400" />
        </Link>
    )
}
