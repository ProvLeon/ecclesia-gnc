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
  Clock,
  TrendingUp,
  Zap,
  Calendar,
  AlertCircle,
  PieChart,
  LineChart,
  Activity,
  Receipt,
} from 'lucide-react'
import Link from 'next/link'

const reportCategories = [
  {
    title: 'Membership Reports',
    description: 'Member insights and directory',
    icon: Users,
    color: 'primary',
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
        icon: Calendar,
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
    title: 'Financial Reports',
    description: 'Income, expenses, and giving trends',
    icon: Wallet,
    color: 'success',
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
    title: 'Attendance Reports',
    description: 'Service attendance and engagement',
    icon: CalendarCheck,
    color: 'accent',
    reports: [
      {
        label: 'Weekly Report',
        href: '/reports/attendance',
        desc: 'Service attendance summary and trends',
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
    title: 'Pastoral Care',
    description: 'Follow-up activities and shepherding',
    icon: Heart,
    color: 'warning',
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

const colorConfig = {
  primary: {
    badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    icon: 'text-blue-600 dark:text-blue-400',
    accent: 'bg-blue-100 dark:bg-blue-900/30',
    card: 'border-blue-200 dark:border-blue-800 group-hover:border-blue-300 dark:group-hover:border-blue-700',
  },
  success: {
    badge: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
    icon: 'text-green-600 dark:text-green-400',
    accent: 'bg-green-100 dark:bg-green-900/30',
    card: 'border-green-200 dark:border-green-800 group-hover:border-green-300 dark:group-hover:border-green-700',
  },
  accent: {
    badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    icon: 'text-amber-600 dark:text-amber-400',
    accent: 'bg-amber-100 dark:bg-amber-900/30',
    card: 'border-amber-200 dark:border-amber-800 group-hover:border-amber-300 dark:group-hover:border-amber-700',
  },
  warning: {
    badge: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
    icon: 'text-rose-600 dark:text-rose-400',
    accent: 'bg-rose-100 dark:bg-rose-900/30',
    card: 'border-rose-200 dark:border-rose-800 group-hover:border-rose-300 dark:group-hover:border-rose-700',
  },
}

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Reports & Analytics
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-lg">
              Generate insights and analyze church data across all ministries
            </p>
          </div>
          <Link href="/reports/analytics" className="hidden sm:block">
            <Button variant="default" className="gap-2 transition-shadow text-primary-foreground dark:text-primary">
              <TrendingUp className="h-4 w-4" />
              View Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900"
        >
          <Calendar className="h-4 w-4" />
          Filter by Date
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900"
        >
          <Download className="h-4 w-4" />
          Export All
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900"
        >
          <Clock className="h-4 w-4" />
          Scheduled Reports
        </Button>
      </div>

      {/* Quick Export Section */}
      <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-transparent dark:from-slate-950/50 dark:to-transparent shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10 dark:bg-primary/20 flex-shrink-0">
                <Download className="h-5 w-5 text-primary dark:text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Quick Export
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  Download commonly needed reports in CSV format for further analysis
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none gap-1 text-xs sm:text-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <FileText className="h-4 w-4" />
                Members
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none gap-1 text-xs sm:text-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <FileText className="h-4 w-4" />
                Tithes ({new Date().getFullYear()})
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none gap-1 text-xs sm:text-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <FileText className="h-4 w-4" />
                Attendance
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Categories */}
      <div className="space-y-12">
        {reportCategories.map((category) => {
          const config = colorConfig[category.color as keyof typeof colorConfig]
          const CategoryIcon = category.icon

          return (
            <section key={category.title} className="space-y-4">
              {/* Category Header */}
              <div className="flex items-start gap-4 pb-2">
                <div className={`p-3 rounded-lg ${config.accent} flex-shrink-0`}>
                  <CategoryIcon className={`h-6 w-6 ${config.icon}`} />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {category.title}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    {category.description}
                  </p>
                </div>
              </div>

              {/* Reports Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {category.reports.map((report) => {
                  const ReportIcon = report.icon
                  return (
                    <Link key={report.href} href={report.href} className="group">
                      <Card className={`border-slate-200 dark:border-slate-700 h-full hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer ${config.card}`}>
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        <CardContent className="pt-5 pb-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className={`p-2.5 rounded-lg ${config.accent} flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                                <ReportIcon className={`h-4 w-4 ${config.icon}`} />
                              </div>
                              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary dark:group-hover:text-accent group-hover:translate-x-1 transition-all duration-200 opacity-0 group-hover:opacity-100" />
                            </div>

                            <div className="space-y-1">
                              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-accent transition-colors text-sm leading-snug">
                                {report.label}
                              </h3>
                              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                                {report.desc}
                              </p>
                            </div>

                            <div className="pt-2 flex items-center gap-1">
                              <span className={`text-xs font-medium ${config.icon} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                Open Report
                              </span>
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

      {/* Advanced Features Coming Soon */}
      <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-amber-50 to-transparent dark:from-amber-950/30 dark:to-transparent shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex-shrink-0">
              <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Advanced Analytics Coming Soon
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 mb-3">
                Interactive charts, custom report builder, predictive insights, and automated scheduled reports will be available in the next update.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="border-amber-300 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              >
                Learn More <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips & Best Practices */}
      <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/30 dark:to-transparent shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                Report Tips & Best Practices
              </h3>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary dark:text-accent font-semibold flex-shrink-0 mt-0.5">•</span>
                  <span>
                    <strong>Monthly Reviews:</strong> Check key metrics monthly to identify trends and opportunities
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary dark:text-accent font-semibold flex-shrink-0 mt-0.5">•</span>
                  <span>
                    <strong>Data Export:</strong> Use quick export to share insights with leadership and stakeholders
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary dark:text-accent font-semibold flex-shrink-0 mt-0.5">•</span>
                  <span>
                    <strong>Comparative Analysis:</strong> Compare periods to understand seasonal patterns
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary dark:text-accent font-semibold flex-shrink-0 mt-0.5">•</span>
                  <span>
                    <strong>Action-Oriented:</strong> Use insights to inform ministry decisions and resource allocation
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
