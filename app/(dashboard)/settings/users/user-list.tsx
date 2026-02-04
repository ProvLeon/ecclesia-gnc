'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Shield, UserX, UserCheck, Loader2 } from 'lucide-react'
import { updateUserRole, toggleUserStatus } from '@/app/actions/users'

interface UserListProps {
    users: {
        id: string
        email: string
        role: string
        isActive: boolean
        lastLogin: Date | null
        memberName: string | null
    }[]
    roleColors: Record<string, string>
}

const ROLES = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'pastor', label: 'Pastor' },
    { value: 'treasurer', label: 'Treasurer' },
    { value: 'dept_leader', label: 'Dept Leader' },
    { value: 'shepherd', label: 'Shepherd' },
    { value: 'member', label: 'Member' },
]

export function UserList({ users, roleColors }: UserListProps) {
    const [loading, setLoading] = useState<string | null>(null)
    const router = useRouter()

    async function handleRoleChange(userId: string, role: string) {
        setLoading(userId)
        await updateUserRole(userId, role as any)
        setLoading(null)
        router.refresh()
    }

    async function handleToggleStatus(userId: string) {
        setLoading(userId)
        await toggleUserStatus(userId)
        setLoading(null)
        router.refresh()
    }

    if (users.length === 0) {
        return (
            <div className="p-8 text-center text-slate-500">
                No users found
            </div>
        )
    }

    return (
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {users.map((user) => (
                <div
                    key={user.id}
                    className={`p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 ${!user.isActive ? 'opacity-50' : ''}`}
                >
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-medium text-slate-900 dark:text-white">
                                {user.memberName || user.email}
                            </h3>
                            <Badge
                                variant="secondary"
                                className={roleColors[user.role] || roleColors.member}
                            >
                                {user.role.replace('_', ' ')}
                            </Badge>
                            {!user.isActive && (
                                <Badge variant="destructive" className="bg-red-100 text-red-700">
                                    Inactive
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{user.email}</p>
                        {user.lastLogin && (
                            <p className="text-xs text-slate-400 mt-1">
                                Last login: {new Date(user.lastLogin).toLocaleDateString()}
                            </p>
                        )}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={loading === user.id}>
                                {loading === user.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <MoreVertical className="h-4 w-4" />
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem disabled className="text-xs font-medium text-slate-400">
                                <Shield className="h-4 w-4 mr-2" />
                                Change Role
                            </DropdownMenuItem>
                            {ROLES.map((role) => (
                                <DropdownMenuItem
                                    key={role.value}
                                    onClick={() => handleRoleChange(user.id, role.value)}
                                    className={user.role === role.value ? 'bg-slate-100' : ''}
                                >
                                    {role.label}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => handleToggleStatus(user.id)}
                                className={user.isActive ? 'text-red-600' : 'text-green-600'}
                            >
                                {user.isActive ? (
                                    <>
                                        <UserX className="h-4 w-4 mr-2" />
                                        Deactivate
                                    </>
                                ) : (
                                    <>
                                        <UserCheck className="h-4 w-4 mr-2" />
                                        Activate
                                    </>
                                )}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ))}
        </div>
    )
}
