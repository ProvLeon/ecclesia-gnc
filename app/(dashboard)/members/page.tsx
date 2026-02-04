import { Suspense } from 'react'
import Link from 'next/link'
import { getMembers, getMemberStats } from '@/app/actions/members'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Plus, Search, Users, UserCheck, UserX, UserPlus } from 'lucide-react'
import { AddMemberButton } from './components/add-member-button'
import { MemberTableClient } from './components/member-table-client'

interface PageProps {
    searchParams: Promise<{
        search?: string
        status?: string
        page?: string
    }>
}

export default async function MembersPage({ searchParams }: PageProps) {
    const params = await searchParams
    const search = params.search || ''
    const status = params.status || 'all'
    const page = parseInt(params.page || '1', 10)

    const [{ data: members, pagination }, stats] = await Promise.all([
        getMembers({ search, status, page, pageSize: 10 }),
        getMemberStats(),
    ])

    const statusColors = {
        active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        inactive: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        visitor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        new_convert: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Members
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Manage church members and their information
                    </p>
                </div>
                <AddMemberButton />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Members"
                    value={stats?.total || 0}
                    icon={Users}
                    color="blue"
                />
                <StatsCard
                    title="Active"
                    value={stats?.active || 0}
                    icon={UserCheck}
                    color="green"
                />
                <StatsCard
                    title="Visitors"
                    value={stats?.visitors || 0}
                    icon={UserPlus}
                    color="amber"
                />
                <StatsCard
                    title="Inactive"
                    value={stats?.inactive || 0}
                    icon={UserX}
                    color="red"
                />
            </div>

            {/* Filters */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardContent className="pt-6">
                    <form className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                name="search"
                                placeholder="Search by name, phone, email, or ID..."
                                defaultValue={search}
                                className="pl-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                            />
                        </div>
                        <Select name="status" defaultValue={status}>
                            <SelectTrigger className="w-full sm:w-[180px] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
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
                        <Button type="submit" variant="secondary">
                            Filter
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Members Table */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardContent className="p-0">
                    <MemberTableClient
                        members={members}
                        search={search}
                        statusColors={statusColors}
                    />

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
                                {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
                                {pagination.total} members
                            </p>
                            <div className="flex gap-2">
                                <Link
                                    href={`/members?search=${search}&status=${status}&page=${Math.max(1, page - 1)}`}
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page <= 1}
                                    >
                                        Previous
                                    </Button>
                                </Link>
                                <Link
                                    href={`/members?search=${search}&status=${status}&page=${Math.min(pagination.totalPages, page + 1)}`}
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page >= pagination.totalPages}
                                    >
                                        Next
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
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
    color: 'blue' | 'green' | 'amber' | 'red'
}) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
        amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
        red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    }

    return (
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${colors[color]}`}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {value}
                </div>
            </CardContent>
        </Card>
    )
}
