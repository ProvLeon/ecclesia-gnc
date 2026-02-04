import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    PlusCircle,
    Users,
    Shield,
    UserCheck,
    ArrowLeft
} from 'lucide-react'
import { getUsers, getUserStats } from '@/app/actions/users'
import { UserList } from './user-list'

const ROLE_COLORS: Record<string, string> = {
    super_admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    pastor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    treasurer: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    dept_leader: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    shepherd: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    member: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
}

export default async function UsersPage() {
    const [usersData, stats] = await Promise.all([
        getUsers(),
        getUserStats(),
    ])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <Link href="/settings">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            User Management
                        </h1>
                        <p className="text-sm text-slate-500">
                            Manage system users and their roles
                        </p>
                    </div>
                </div>
                <Link href="/settings/users/new">
                    <Button>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add User
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                            <Users className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.total}</p>
                            <p className="text-xs text-slate-500">Total Users</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                            <UserCheck className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.active}</p>
                            <p className="text-xs text-slate-500">Active</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                            <Shield className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.admins}</p>
                            <p className="text-xs text-slate-500">Admins</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.shepherds}</p>
                            <p className="text-xs text-slate-500">Shepherds</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* User List */}
            <Card>
                <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                    <CardTitle>All Users</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <UserList
                        users={usersData.data}
                        roleColors={ROLE_COLORS}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
