import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Send, Check, X, Clock, History, ArrowRight, FileText } from 'lucide-react'
import Link from 'next/link'
import { getMessageStats, getMessages } from '@/app/actions/messages'
import { format } from 'date-fns'
import { ComposeMessageModal, BroadcastModal, NewTemplateModal } from '@/components/modals'

export const dynamic = 'force-dynamic'
export const revalidate = 0


export default async function MessagesPage() {
  const [stats, { data: recentMessages }] = await Promise.all([
    getMessageStats(),
    getMessages(1, 10),
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Messages</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Send SMS to church members</p>
        </div>
        <div className="flex gap-2">
          <Link href="/messages/templates">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />Templates
            </Button>
          </Link>
          <BroadcastModal />
          <ComposeMessageModal />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Sent"
          value={stats.totalSent.toLocaleString()}
          subtitle="All time"
          icon={Send}
        />
        <StatCard
          title="This Month"
          value={stats.sentThisMonth.toString()}
          subtitle="Messages sent"
          icon={Clock}
        />
        <StatCard
          title="Failed"
          value={stats.failed.toString()}
          subtitle="Delivery failures"
          icon={X}
          alert={stats.failed > 0}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <QuickAction icon={Send} label="Compose New" description="Send to individuals" href="/messages/compose" />
        <QuickAction icon={MessageSquare} label="Broadcast" description="Send to groups" href="/messages/broadcast" />
        <QuickAction icon={History} label="History" description="View all messages" href="/messages/history" />
        <QuickAction icon={Clock} label="Scheduled" description="Pending messages" href="/messages/scheduled" />
      </div>

      {/* Recent Messages */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
              <MessageSquare className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <CardTitle className="text-base font-medium">Recent Messages</CardTitle>
              <CardDescription>Latest SMS activity</CardDescription>
            </div>
          </div>
          <Link href="/messages/history">
            <Button variant="ghost" size="sm" className="text-slate-500">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="pt-0">
          {recentMessages.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No messages sent yet</p>
              <p className="text-sm mt-1">Start by composing your first message</p>
              <Link href="/messages/compose">
                <Button className="mt-4" size="sm">
                  <Send className="h-4 w-4 mr-2" />Compose
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentMessages.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 dark:text-white truncate">{m.messageText.slice(0, 60)}{m.messageText.length > 60 ? '...' : ''}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs py-0 h-5">{m.recipientType || 'Individual'}</Badge>
                      <span className="text-xs text-slate-500">
                        {m.totalRecipients || 0} recipients
                      </span>
                      <span className="text-xs text-slate-400">
                        {m.createdAt && format(new Date(m.createdAt), 'MMM d, h:mm a')}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      m.status === 'sent'
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400'
                        : m.status === 'failed'
                          ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                    }
                  >
                    {m.status === 'sent' && <Check className="h-3 w-3 mr-1" />}
                    {m.status === 'failed' && <X className="h-3 w-3 mr-1" />}
                    {m.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
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
    <Card className={`border-slate-200 dark:border-slate-700 ${alert ? 'border-l-2 border-l-red-500' : ''}`}>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
            <p className={`text-2xl font-semibold mt-1 ${alert ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>{value}</p>
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          </div>
          <div className={`p-2 rounded-lg ${alert ? 'bg-red-50 dark:bg-red-900/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
            <Icon className={`h-5 w-5 ${alert ? 'text-red-600' : 'text-slate-500 dark:text-slate-400'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function QuickAction({ icon: Icon, label, description, href }: {
  icon: React.ElementType
  label: string
  description: string
  href: string
}) {
  return (
    <Link href={href}>
      <Card className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer h-full">
        <CardContent className="pt-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
              <Icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="font-medium text-sm text-slate-900 dark:text-white">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
