'use client'

import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, LogOut, Settings, User as UserIcon } from 'lucide-react'
import { logout } from '@/app/actions/auth'
import { MobileSidebarTrigger } from './sidebar'
import { UserRole } from '@/lib/constants/roles'

interface HeaderProps {
    user: User & { role: UserRole }
}

export function Header({ user }: HeaderProps) {
    const router = useRouter()

    const name = user.user_metadata?.full_name || user.user_metadata?.first_name
    const displayName = name || user.email?.split('@')[0] || 'User'
    const initials = name
        ? name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        : user.email?.substring(0, 2).toUpperCase() || 'US'

    async function handleLogout() {
        await logout()
    }

    return (
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                {/* Left side - Mobile menu and page title */}
                <div className="flex items-center gap-4">
                    <MobileSidebarTrigger userRole={user.role} />
                    <div className="hidden sm:block">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Good News Centre AG
                        </h2>
                    </div>
                </div>

                {/* Right side - Notifications and User menu */}
                <div className="flex items-center gap-3">
                    {/* Notifications */}
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                    </Button>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={user.user_metadata?.avatar_url || ''} alt={displayName} className="object-cover" />
                                    <AvatarFallback className="bg-blue-600 text-white text-sm">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium">{displayName}</p>
                                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                    <p className="text-xs text-slate-400 capitalize">{user.role.replace('_', ' ')}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push('/settings/profile')}>
                                <UserIcon className="mr-2 h-4 w-4" />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/settings')}>
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                                <LogOut className="mr-2 h-4 w-4" />
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
