'use client'

import { useEffect, useState } from 'react'
import { getFollowUpStats, getShepherdFollowUps } from '@/app/actions/follow-ups'
import { FollowUpList } from '@/components/follow-ups/follow-up-list'
import { FollowUpForm } from '@/components/follow-ups/follow-up-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle2, AlertCircle, Users } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface FollowUp {
  id: string
  title: string
  status: string
  priority: string
  followUpType: string
  scheduledDate: Date | string
  dueDate?: Date | string | null
  outcome?: string | null
  memberName?: string
  memberPhone?: string
  shepherdName?: string
}

export default function FollowUpsPage() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    overdue: 0,
  })
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFollowUp, setSelectedFollowUp] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [statsResult] = await Promise.all([getFollowUpStats()])

      setStats(statsResult)

      // Load follow-ups (in a real app, would filter by shepherd)
      // For now, we'll display a placeholder
      setFollowUps([])
    } catch (error) {
      console.error('Failed to load follow-ups:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = (id: string) => {
    setSelectedFollowUp(id)
    // Open completion modal
  }

  const handleView = (id: string) => {
    // Navigate to detail page
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Follow-ups</h1>
          <p className="text-gray-600 mt-2">Manage and track member follow-ups</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Users className="h-4 w-4 mr-2" />
              Create Follow-up
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Follow-up</DialogTitle>
              <DialogDescription>
                Create a new follow-up for a member
              </DialogDescription>
            </DialogHeader>
            <FollowUpForm
              memberId=""
              memberName=""
              onSuccess={() => {
                setShowCreateModal(false)
                loadData()
              }}
              onCancel={() => setShowCreateModal(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          icon={Clock}
          title="Pending"
          value={stats.pending}
          subtitle="Awaiting assignment"
          color="blue"
        />
        <StatCard
          icon={AlertCircle}
          title="Assigned"
          value={stats.assigned}
          subtitle="In queue"
          color="yellow"
        />
        <StatCard
          icon={Clock}
          title="In Progress"
          value={stats.inProgress}
          subtitle="Currently being handled"
          color="purple"
        />
        <StatCard
          icon={CheckCircle2}
          title="Completed"
          value={stats.completed}
          subtitle="This period"
          color="green"
        />
      </div>

      {/* Overdue Alert */}
      {stats.overdue > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">
                  {stats.overdue} Overdue Follow-ups
                </p>
                <p className="text-sm text-red-800">
                  These follow-ups are past their due date and need attention
                </p>
              </div>
            </div>
            <Button variant="outline" className="border-red-300 hover:bg-red-100">
              View Overdue
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Follow-ups List */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Follow-ups</CardTitle>
          <CardDescription>
            All follow-ups across the organization
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <FollowUpList
            followUps={followUps}
            isLoading={isLoading}
            onComplete={handleComplete}
            onView={handleView}
            emptyMessage="No follow-ups to display"
          />
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  color = 'blue',
}: {
  icon: React.ElementType
  title: string
  value: number
  subtitle: string
  color?: 'blue' | 'yellow' | 'green' | 'purple' | 'red'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    red: 'bg-red-50 text-red-600 border-red-200',
  }

  return (
    <Card className={`border ${colorClasses[color]}`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold mt-2 text-gray-900">{value}</p>
            <p className="text-xs text-gray-600 mt-2">{subtitle}</p>
          </div>
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
