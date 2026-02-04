import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  FileText,
  Download,
  Users,
  Wallet,
  CalendarCheck,
  Heart,
  ArrowRight,
  TrendingUp,
  LineChart,
  AlertCircle,
  PieChart,
  Activity,
  Receipt,
} from 'lucide-react'
import Link from 'next/link'

const reportCategories = [
  {
    title: 'Attendance',
    description: 'Service attendance and member engagement metrics',
    icon: CalendarCheck,
    color: 'from-blue-500 to-cyan-500',
    lightColor: 'bg-blue-50 dark:bg-blue-950/30',
    reports: [
      {
        label: 'Weekly Report',
        href: '/reports/attendance',
        desc: 'Current service attendance summary',
        icon: BarChart3,
      },
      {
        label: 'Attendance Trends',
        href: '/reports/attendance/trends',
        desc: 'Monthly patterns and growth analysis',
        icon: LineChart,
      },
      {
        label: 'Absentees',
        href: '/reports/attendance/absentees',
        desc: 'Members missing recent services',
        icon: AlertCircle,
      },
      {
        label: 'Service Comparison',
        href: '/reports/attendance/comparison',
        desc: 'Compare different service types',
        icon: Activity,
      },
    ],
  },
  {
    title: 'Financial',
    description: 'Income, expenses, and giving analysis',
    icon: Wallet,
    color: 'from-emerald-500 to-teal-500',
    lightColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    reports: [
      {
        label: 'Monthly Summary',
        href: '/reports/finance',
        desc: 'Income and expenses overview',
        icon: BarChart3,
      },
      {
        label: 'Tithe Report',
        href: '/reports/finance/tithes',
        desc: 'Individual tithe records and trends',
        icon: FileText,
      },
      {
        label: 'Offering Analysis',
        href: '/reports/finance/offerings',
        desc: 'Offering trends by type and period',
        icon: PieChart,
      },
      {
        label: 'Expense Report',
        href: '/reports/finance/expenses',
        desc: 'Detailed expense breakdown and budget',
        icon: Receipt,
      },
    ],
  },
  {
    title: 'Membership',
    description: 'Member directory and engagement tracking',
    icon: Users,
    color: 'from-purple-500 to-pink-500',
    lightColor: 'bg-purple-50 dark:bg-purple-950/30',
    reports: [
      {
        label: 'Member Directory',
        href: '/reports/members',
        desc: 'Full list of all members with contact details',
        icon: FileText,
      },
      {
        label: 'New Members',
        href: '/reports/members/new',
        desc: 'Monthly new member report and analytics',
        icon: TrendingUp,
      },
      {
        label: 'Birthdays This Month',
        href: '/reports/members/birthdays',
        desc: 'Upcoming celebrations to remember',
        icon: CalendarCheck,
      },
      {
        label: 'Inactive Members',
        href: '/reports/members/inactive',
        desc: 'Members needing outreach and care',
        icon: AlertCircle,
      },
    ],
  },
  {
    title: 'Pastoral Care',
    description: 'Follow-up activities and shepherding metrics',
    icon: Heart,
    color: 'from-rose-500 to-orange-500',
    lightColor: 'bg-rose-50 dark:bg-rose-950/30',
    reports: [
      {
        label: 'Follow-up Summary',
        href: '/reports/shepherding',
        desc: 'Pastoral visit activity and metrics',
        icon: Heart,
      },
      {
        label: 'Overdue Visits',
        href: '/reports/shepherding/overdue',
        desc: 'Visits needing urgent attention',
        icon: AlertCircle,
      },
      {
        label: 'Shepherd Activity',
        href: '/reports/shepherding/shepherds',
        desc: 'Team performance and assignments',
        icon: Users,
      },
    ],
  },
]

const quickAccessReports = [
  {
    label: 'Weekly Attendance',
    href: '/reports/attendance',
    icon: CalendarCheck,
    description: 'This week\'s attendance',
  },
  {
    label: 'Monthly Finance',
    href: '/reports/finance',
    icon: Wallet,
    description: 'Income & expenses',
  },
  {
    label: 'Member Directory',
    href: '/reports/members',
    icon: Users,
    description: 'All members',
  },
  {
    label: 'Pastoral Activity',
    href: '/reports/shepherding',
    icon: Heart,
    description: 'Follow-ups & visits',
  },
]

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          Reports & Analytics
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Track key metrics and insights across your church ministries
        </p>
      </div>

      {/* Quick Access Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {quickAccessReports.map((report) => {
          const Icon = report.icon
          return (
            <Link key={report.href} href={report.href}>
              <Card className="border-slate-200 dark:border-slate-700 h-full hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/10 dark:group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-5 w-5 text-slate-700 dark:text-slate-300 group-hover:text-primary dark:group-hover:text-accent transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">
                        {report.label}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {report.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-primary dark:group-hover:text-accent group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Report Categories */}
      <div className="space-y-10">
        {reportCategories.map((category) => {
          const CategoryIcon = category.icon

          return (
            <section key={category.title} className="space-y-4">
              {/* Category Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className={`p-2.5 rounded-lg bg-gradient-to-br ${category.color} flex-shrink-0`}>
                  <CategoryIcon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {category.title}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {category.description}
                  </p>
                </div>
              </div>

              {/* Reports Grid */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {category.reports.map((report) => {
                  const ReportIcon = report.icon
                  return (
                    <Link key={report.href} href={report.href} className="group h-full">
                      <Card className="border-slate-200 dark:border-slate-700 h-full hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 overflow-hidden cursor-pointer">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className={`p-2 rounded-lg ${category.lightColor} flex-shrink-0`}>
                                <ReportIcon className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                              </div>
                              <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors flex-shrink-0" />
                            </div>

                            <div className="space-y-1">
                              <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug">
                                {report.label}
                              </h3>
                              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                                {report.desc}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      {/* Export Section */}
      <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-slate-50/50 dark:from-slate-900/40 dark:to-slate-900/20">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-lg bg-slate-200 dark:bg-slate-800 flex-shrink-0">
                <Download className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Export Reports
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Download common reports in CSV format for analysis and sharing
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none text-sm"
              >
                Members
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none text-sm"
              >
                Attendance
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none text-sm"
              >
                Finance
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
