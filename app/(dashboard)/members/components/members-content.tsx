'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, Users, UserCheck, UserX, UserPlus, Phone, Mail, Calendar, ArrowRight, Filter, Download } from 'lucide-react'
import { SkeletonTable, SkeletonStat } from '@/components/ui/skeleton'
import { useNotification } from '@/hooks'
import { AddMemberButton } from './add-member-button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Member {
  id: string
  memberId: string
  firstName: string
  lastName: string
  middleName?: string | null
  phonePrimary: string | null
  email: string | null
  memberStatus: string | null
  photoUrl: string | null
  joinDate: string | null
}

interface StatsData {
  total: number
  active: number
  inactive: number
  visitors: number
}

interface MembersResponse {
  success: boolean
  data: Member[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

interface StatsResponse {
  success: boolean
  data: StatsData
}

const statusConfig = {
  active: {
    label: 'Active',
    color: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
    icon: '✓'
  },
  inactive: {
    label: 'Inactive',
    color: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    icon: '✕'
  },
  visitor: {
    label: 'Visitor',
    color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    icon: '→'
  },
  new_convert: {
    label: 'New Convert',
    color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    icon: '✚'
  },
}

export function MembersContent() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [view, setView] = useState<'table' | 'grid'>('table')
  const { error: notifyError } = useNotification()

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  // Fetch members
  const membersUrl = `/api/members?search=${encodeURIComponent(debouncedSearch)}&status=${status}&page=${page}&pageSize=10`
  const { data: membersData, isLoading: membersLoading, error: membersError } = useSWR<MembersResponse>(
    membersUrl,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
    }
  )

  // Fetch stats
  const { data: statsData, isLoading: statsLoading, error: statsError } = useSWR<StatsResponse>(
    '/api/members/stats',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 120000,
    }
  )

  // Handle errors
  useEffect(() => {
    if (membersError) {
      notifyError('Error', 'Failed to load members')
    }
  }, [membersError, notifyError])

  useEffect(() => {
    if (statsError) {
      notifyError('Error', 'Failed to load member statistics')
    }
  }, [statsError, notifyError])

  const members = membersData?.data || []
  const pagination = membersData?.pagination || {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  }
  const stats = statsData?.data || {
    total: 0,
    active: 0,
    inactive: 0,
    visitors: 0,
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const getStatusConfig = (status: string | null) => {
    const key = (status || 'active') as keyof typeof statusConfig
    return statusConfig[key] || statusConfig.active
  }

  return (
    <main className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Members
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-1">
            Manage church members and their information
          </p>
        </div>
        <AddMemberButton />
      </div>

      {/* Stats Cards Grid */}
      {statsLoading ? (
        <SkeletonStat count={4} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatsCard
            title="Total Members"
            value={stats.total}
            icon={Users}
            color="primary"
          />
          <StatsCard
            title="Active"
            value={stats.active}
            icon={UserCheck}
            color="green"
          />
          <StatsCard
            title="Visitors"
            value={stats.visitors}
            icon={UserPlus}
            color="blue"
          />
          <StatsCard
            title="Inactive"
            value={stats.inactive}
            icon={UserX}
            color="red"
          />
        </div>
      )}

      {/* Search & Filter Bar */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, phone, email, or member ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-10"
              />
            </div>

            {/* Filter & View Controls */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <Select value={status} onValueChange={(value) => {
                setStatus(value)
                setPage(1)
              }}>
                <SelectTrigger className="w-full sm:w-[200px] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-10">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="visitor">Visitor</SelectItem>
                  <SelectItem value="new_convert">New Convert</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 h-10">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Export</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members List/Grid */}
      {membersLoading ? (
        <SkeletonTable rows={10} columns={5} />
      ) : members.length === 0 ? (
        <Card className="border-slate-200 dark:border-slate-700">
          <CardContent className="py-12 text-center">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 w-fit mx-auto mb-4">
              <Users className="h-12 w-12 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="font-semibold text-slate-900 dark:text-white text-lg">
              {search || status !== 'all' ? 'No members found' : 'No members yet'}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              {search || status !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Start building your congregation by adding members'}
            </p>
            {!search && status === 'all' && (
              <AddMemberButton />
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Card className="border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Member</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Join Date</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {members.map((member) => {
                      const statusConfig = getStatusConfig(member.memberStatus)
                      return (
                        <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                          <td className="px-6 py-4">
                            <Link href={`/members/${member.id}`}>
                              <div className="flex items-center gap-3 cursor-pointer">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 dark:from-primary/40 dark:to-accent/40 flex items-center justify-center font-semibold text-sm text-primary dark:text-accent flex-shrink-0">
                                  {getInitials(member.firstName, member.lastName)}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                                    {member.firstName} {member.lastName}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {member.memberId}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {member.phonePrimary && (
                                <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                  <Phone className="h-4 w-4 flex-shrink-0" />
                                  {member.phonePrimary}
                                </p>
                              )}
                              {member.email && (
                                <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2 truncate">
                                  <Mail className="h-4 w-4 flex-shrink-0" />
                                  {member.email}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={`${statusConfig.color} border text-xs`}>
                              {statusConfig.label}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                              <Calendar className="h-4 w-4 flex-shrink-0" />
                              {member.joinDate ? format(new Date(member.joinDate), 'MMM d, yyyy') : 'N/A'}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link href={`/members/${member.id}`}>
                              <Button variant="ghost" size="sm" className="text-primary dark:text-accent hover:bg-primary/10 dark:hover:bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                View
                                <ArrowRight className="h-4 w-4 ml-1" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {members.map((member) => {
              const statusConfig = getStatusConfig(member.memberStatus)
              return (
                <Link key={member.id} href={`/members/${member.id}`}>
                  <Card className="border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer group">
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        {/* Member Header */}
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 dark:from-primary/40 dark:to-accent/40 flex items-center justify-center font-semibold text-primary dark:text-accent flex-shrink-0">
                            {getInitials(member.firstName, member.lastName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base truncate">
                              {member.firstName} {member.lastName}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {member.memberId}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-primary dark:group-hover:text-accent group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                        </div>

                        {/* Member Details */}
                        <div className="space-y-2 text-sm">
                          {member.phonePrimary && (
                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                              <Phone className="h-4 w-4 flex-shrink-0" />
                              <span>{member.phonePrimary}</span>
                            </div>
                          )}
                          {member.email && (
                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 truncate">
                              <Mail className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{member.email}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>{member.joinDate ? format(new Date(member.joinDate), 'MMM d, yyyy') : 'N/A'}</span>
                          </div>
                        </div>

                        {/* Footer with Status */}
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                          <Badge className={`${statusConfig.color} border text-xs`}>
                            {statusConfig.label}
                          </Badge>
                          <span className="text-xs text-slate-500 dark:text-slate-400">View →</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 text-center sm:text-left">
                    Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
                    {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
                    {pagination.total} members
                  </p>
                  <div className="flex gap-2 justify-center sm:justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(Math.max(1, page - 1))}
                      className="h-9"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1 px-3 text-sm font-medium">
                      Page {pagination.page} of {pagination.totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                      className="h-9"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </main>
  )
}

function StatsCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string
  value: number
  icon: React.ElementType
  color: 'primary' | 'green' | 'blue' | 'red'
}) {
  const colors = {
    primary: 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-accent',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  }

  return (
    <Card className="border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            {title}
          </CardTitle>
          <div className={`p-2 rounded-lg ${colors[color]}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          {value}
        </p>
      </CardContent>
    </Card>
  )
}
