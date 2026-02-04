'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Calendar,
  Mail,
  Phone,
  Gift,
  Download,
  Send,
} from 'lucide-react'
import { StatCard, ReportHeader, ReportFooter } from '@/components/reports'

// Mock data - replace with actual data fetching
const birthdayMembers = [
  {
    id: '1',
    firstName: 'Emma',
    lastName: 'Anderson',
    email: 'emma@example.com',
    phone: '+233 XX XXX XXXX',
    birthDate: '1990-01-05',
    age: 34,
    monthDay: 'Jan 5',
  },
  {
    id: '2',
    firstName: 'David',
    lastName: 'Taylor',
    email: 'david@example.com',
    phone: '+233 XX XXX XXXX',
    birthDate: '1985-01-12',
    age: 39,
    monthDay: 'Jan 12',
  },
  {
    id: '3',
    firstName: 'Lisa',
    lastName: 'Martinez',
    email: 'lisa@example.com',
    phone: '+233 XX XXX XXXX',
    birthDate: '1992-01-18',
    age: 32,
    monthDay: 'Jan 18',
  },
  {
    id: '4',
    firstName: 'Thomas',
    lastName: 'Garcia',
    email: 'thomas@example.com',
    phone: '+233 XX XXX XXXX',
    birthDate: '1988-01-22',
    age: 36,
    monthDay: 'Jan 22',
  },
  {
    id: '5',
    firstName: 'Jennifer',
    lastName: 'Rodriguez',
    email: 'jennifer@example.com',
    phone: '+233 XX XXX XXXX',
    birthDate: '1995-01-28',
    age: 29,
    monthDay: 'Jan 28',
  },
]

const stats = {
  totalThisMonth: birthdayMembers.length,
  celebratedLastMonth: 6,
  upcomingNextMonth: 4,
  averageAge: 34,
}

export default function BirthdaysReportPage() {
  const getDaysUntil = (dateString: string) => {
    const [year, month, day] = dateString.split('-')
    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    const today = new Date()

    // Set to this year's birthday
    birthDate.setFullYear(today.getFullYear())

    // If birthday has passed this year, calculate for next year
    if (birthDate < today) {
      birthDate.setFullYear(today.getFullYear() + 1)
    }

    const diffTime = birthDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getAgeThisYear = (birthDate: string) => {
    const [year] = birthDate.split('-')
    return new Date().getFullYear() - parseInt(year)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <ReportHeader
        title="Birthdays This Month"
        description="Celebrate church members' birthdays with cards, calls, and special recognition"
        exportLabel="Export CSV"
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Birthdays This Month"
          value={stats.totalThisMonth}
          description="Members to celebrate"
          icon={Gift}
          variant="primary"
        />
        <StatCard
          title="Celebrated Last Month"
          value={stats.celebratedLastMonth}
          description="Recognition sent"
          icon={Calendar}
          variant="success"
        />
        <StatCard
          title="Coming Next Month"
          value={stats.upcomingNextMonth}
          description="Members to prepare for"
          icon={Users}
          variant="accent"
        />
        <StatCard
          title="Average Age"
          value={stats.averageAge}
          description="Of birthdayees"
          icon={Calendar}
          variant="info"
        />
      </div>

      {/* Birthday Calendar Highlight */}
      <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-rose-50 to-transparent dark:from-rose-950/20 dark:to-transparent">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Gift className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            This Month's Celebrations
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 dark:text-slate-400">
          <p className="mb-4">
            {stats.totalThisMonth} members are celebrating birthdays this month. Remember to send greetings, cards, and prayers to make their day special!
          </p>
          <p className="text-xs">
            Consider organizing group celebrations, surprise gifts, or special recognitions during services.
          </p>
        </CardContent>
      </Card>

      {/* Birthday List */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            Member Birthday Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {birthdayMembers.map((member) => {
              const daysUntil = getDaysUntil(member.birthDate)
              const age = getAgeThisYear(member.birthDate)

              return (
                <div
                  key={member.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex-shrink-0">
                        <Gift className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                          {member.firstName} {member.lastName}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          Turning {age} on {member.monthDay}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 mt-3 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>{member.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                      >
                        In {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0 gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Greet
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Birthday Care Ideas */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-950/20 dark:to-transparent">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Gift className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              Celebration Ideas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <p>
              Make members feel special and valued on their birthday with these thoughtful gestures.
            </p>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <p className="font-semibold text-slate-900 dark:text-white">Ideas:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Send personalized greeting cards</li>
                <li>Make a phone call to wish them</li>
                <li>Recognize during service announcement</li>
                <li>Send a small gift or flowers</li>
                <li>Invite to special member gathering</li>
                <li>Assign prayer partner for the day</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Birthday Program
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <p>
              Establish a consistent birthday recognition program to strengthen community bonds.
            </p>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <p className="font-semibold text-slate-900 dark:text-white">Setup:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Designate birthday committee volunteers</li>
                <li>Maintain birthday calendar in office/lobby</li>
                <li>Budget for greeting cards annually</li>
                <li>Create birthday email or text reminders</li>
                <li>Monthly birthday celebration gatherings</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" className="gap-2">
          <Send className="h-4 w-4" />
          Send Group Greeting
        </Button>
        <Button className="gap-2 bg-primary dark:bg-accent hover:opacity-90 text-primary-foreground dark:text-primary">
          <Download className="h-4 w-4" />
          Export Birthday List
        </Button>
      </div>

      {/* Footer */}
      <ReportFooter
        reportType="Monthly Birthday Report"
        period={new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        dataSource="Member profiles database"
      />
    </div>
  )
}
