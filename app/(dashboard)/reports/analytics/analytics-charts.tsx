'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    FinanceTrendChart,
    AttendanceChart,
    MemberDistributionChart,
    DepartmentComparisonChart
} from '@/components/charts'
import { LineChart, BarChart3, PieChart, Building2 } from 'lucide-react'

interface AnalyticsChartsProps {
    financeTrends: any[]
    attendanceTrends: any[]
    memberDistribution: any[]
    departmentStats: any[]
    memberGrowth: any[]
}

export function AnalyticsCharts({
    financeTrends,
    attendanceTrends,
    memberDistribution,
    departmentStats,
    memberGrowth,
}: AnalyticsChartsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Financial Trends */}
            <Card className="lg:col-span-2">
                <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                    <CardTitle className="flex items-center gap-2">
                        <LineChart className="h-5 w-5 text-indigo-500" />
                        Financial Trends (Last 6 Months)
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <FinanceTrendChart data={financeTrends} height={350} />
                </CardContent>
            </Card>

            {/* Weekly Attendance */}
            <Card>
                <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-green-500" />
                        Weekly Attendance
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <AttendanceChart data={attendanceTrends} height={300} />
                </CardContent>
            </Card>

            {/* Member Distribution */}
            <Card>
                <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                    <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-amber-500" />
                        Member Status Distribution
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <MemberDistributionChart data={memberDistribution} height={300} />
                </CardContent>
            </Card>

            {/* Department Membership */}
            <Card className="lg:col-span-2">
                <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-purple-500" />
                        Department Membership
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <DepartmentComparisonChart data={departmentStats} height={300} />
                </CardContent>
            </Card>
        </div>
    )
}
