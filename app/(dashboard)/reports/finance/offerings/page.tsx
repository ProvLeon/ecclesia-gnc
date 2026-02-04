'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  TrendingUp,
  BarChart3,
  Calendar,
  Download,
  Filter,
  PieChart,
} from 'lucide-react'
import { StatCard, ReportHeader, ReportFooter } from '@/components/reports'
import { ProgressBar } from '@/components/ui/progress-bar'

// Mock data - replace with actual data fetching
const offeringRecords = [
  {
    id: '1',
    type: 'General Offering',
    amount: 2500,
    date: '2024-01-15',
    givers: 45,
    average: 56,
  },
  {
    id: '2',
    type: 'Missions Offering',
    amount: 1800,
    date: '2024-01-14',
    givers: 32,
    average: 56,
  },
  {
    id: '3',
    type: 'Building Fund',
    amount: 3200,
    date: '2024-01-13',
    givers: 28,
    average: 114,
  },
  {
    id: '4',
    type: 'Special Project',
    amount: 1500,
    date: '2024-01-12',
    givers: 25,
    average: 60,
  },
  {
    id: '5',
    type: 'Benevolence Fund',
    amount: 900,
    date: '2024-01-11',
    givers: 18,
    average: 50,
  },
]

const stats = {
  totalOfferings: 25000,
  monthOfferings: 8900,
  averageOffering: 75,
  totalGivers: 250,
  offeringTypes: 5,
  monthGrowth: 12,
}

const offeringTypeBreakdown = [
  { type: 'General Offering', amount: 9800, percentage: 39 },
  { type: 'Missions Offering', amount: 6200, percentage: 25 },
  { type: 'Building Fund', amount: 5600, percentage: 22 },
  { type: 'Special Projects', amount: 2400, percentage: 10 },
  { type: 'Benevolence', amount: 900, percentage: 4 },
]

export default function OfferingAnalysisPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <ReportHeader
        title="Offering Analysis"
        description="Detailed breakdown of offering types, trends, and giving patterns"
        exportLabel="Export CSV"
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Offerings"
          value={`GH₵ ${stats.monthOfferings.toLocaleString()}`}
          description="This month total"
          icon={DollarSign}
          variant="success"
          trend={{
            value: stats.monthGrowth,
            direction: 'up',
          }}
        />
        <StatCard
          title="Total Givers"
          value={stats.totalGivers}
          description="Active offering givers"
          icon={BarChart3}
          variant="primary"
        />
        <StatCard
          title="Average Offering"
          value={`GH₵ ${stats.averageOffering}`}
          description="Per giver"
          icon={DollarSign}
          variant="accent"
        />
        <StatCard
          title="Offering Types"
          value={stats.offeringTypes}
          description="Different categories"
          icon={PieChart}
          variant="info"
        />
      </div>

      {/* Offering Type Breakdown */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Offering by Type
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {offeringTypeBreakdown.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-slate-900 dark:text-white">{item.type}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.percentage}%</Badge>
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                      GH₵ {item.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
                <ProgressBar value={item.percentage} variant="success" showPercentage={false} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Offerings */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Recent Offering Collections
            </CardTitle>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {offeringRecords.map((record) => (
              <div
                key={record.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{record.type}</h3>
                  <div className="flex flex-col sm:flex-row gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                    <span>
                      <strong>Date:</strong> {new Date(record.date).toLocaleDateString()}
                    </span>
                    <span>
                      <strong>Givers:</strong> {record.givers} people
                    </span>
                    <span>
                      <strong>Average:</strong> GH₵ {record.average}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      GH₵ {record.amount.toLocaleString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trends & Insights */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/20 dark:to-transparent">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              Offering Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <p>
              Overall offering participation shows positive growth trend with {stats.monthGrowth}% increase this month.
            </p>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <p className="font-semibold text-slate-900 dark:text-white">Observations:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>General offerings remain the largest category</li>
                <li>Building fund shows strong momentum</li>
                <li>Missions giving demonstrates global awareness</li>
                <li>Seasonal variations affect special offerings</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Strategic Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <p>
              Enhance offering communication and participation with targeted strategies.
            </p>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <p className="font-semibold text-slate-900 dark:text-white">Action Items:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Highlight impact of each offering type in services</li>
                <li>Create quarterly special offering campaigns</li>
                <li>Provide transparent reporting on fund usage</li>
                <li>Recognize major contributors appropriately</li>
                <li>Encourage online offering options</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          View Monthly Trends
        </Button>
        <Button className="gap-2 bg-primary dark:bg-accent hover:opacity-90 text-primary-foreground dark:text-primary">
          <Download className="h-4 w-4" />
          Export Analysis
        </Button>
      </div>

      {/* Footer */}
      <ReportFooter
        reportType="Offering Analysis Report"
        period={new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        dataSource="Financial records database"
      />
    </div>
  )
}
