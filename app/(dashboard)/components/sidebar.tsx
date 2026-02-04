'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Users,
    Wallet,
    CalendarCheck,
    Heart,
    MessageSquare,
    Building2,
    BarChart3,
    Settings,
    ChevronLeft,
    Calendar,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Members', href: '/members', icon: Users },
    { name: 'Finance', href: '/finance', icon: Wallet },
    { name: 'Attendance', href: '/attendance', icon: CalendarCheck },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Shepherding', href: '/shepherding', icon: Heart },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'Departments', href: '/departments', icon: Building2 },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
]

const bottomNav = [
    { name: 'Settings', href: '/settings', icon: Settings },
]

function NavItem({ item, isActive }: { item: typeof navigation[0]; isActive: boolean }) {
    return (
        <Link
            href={item.href}
            className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            )}
        >
            <item.icon className="h-5 w-5" />
            {item.name}
        </Link>
    )
}

function SidebarContent() {
    const pathname = usePathname()

    return (
        <div className="flex h-full flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200 dark:border-slate-800">
                <Image
                    src="/ecclesia_logomark_Wbg.png"
                    alt="Ecclesia"
                    width={40}
                    height={40}
                    className="dark:hidden"
                />
                <Image
                    src="/ecclesia_logomark_Bbg.png"
                    alt="Ecclesia"
                    width={40}
                    height={40}
                    className="hidden dark:block"
                />
                <div>
                    <h1 className="font-bold text-lg text-slate-900 dark:text-white">Ecclesia</h1>
                    <p className="text-xs text-slate-500">GNC AG Ejisu</p>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => (
                    <NavItem
                        key={item.name}
                        item={item}
                        isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                    />
                ))}
            </nav>

            {/* Bottom Navigation */}
            <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
                {bottomNav.map((item) => (
                    <NavItem
                        key={item.name}
                        item={item}
                        isActive={pathname === item.href}
                    />
                ))}
            </div>
        </div>
    )
}

export function Sidebar() {
    const [open, setOpen] = useState(false)

    return (
        <>
            {/* Mobile Sidebar */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="left" className="p-0 w-72">
                    <SidebarContent />
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72">
                <SidebarContent />
            </div>
        </>
    )
}

// Export for mobile menu trigger
export function MobileSidebarTrigger() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
                <SidebarContent />
            </SheetContent>
        </Sheet>
    )
}
