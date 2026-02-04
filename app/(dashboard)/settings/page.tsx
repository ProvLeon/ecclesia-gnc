import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Users, Bell, Shield, Database, ChevronRight, Building2, Key, Palette } from 'lucide-react'
import Link from 'next/link'

const settingsItems = [
    {
        icon: User,
        title: 'Profile',
        description: 'Update your account details and personal information',
        href: '/settings/profile',
    },
    {
        icon: Users,
        title: 'User Management',
        description: 'Manage system users, roles and permissions',
        href: '/settings/users',
    },
    {
        icon: Shield,
        title: 'Security',
        description: 'Password, two-factor authentication, and sessions',
        href: '/settings/security',
    },
    {
        icon: Bell,
        title: 'Notifications',
        description: 'Configure email and push notification preferences',
        href: '/settings/notifications',
    },
    {
        icon: Database,
        title: 'Data Management',
        description: 'Import from Google Sheets, backup and export',
        href: '/settings/data',
    },
    {
        icon: Building2,
        title: 'Church Profile',
        description: 'Church name, logo, and contact information',
        href: '/settings/church',
    },
    {
        icon: Key,
        title: 'API Keys',
        description: 'Manage SMS and integration credentials',
        href: '/settings/api',
    },
]

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Settings</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account and system preferences</p>
            </div>

            {/* Settings Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {settingsItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                        <Card className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors h-full group cursor-pointer">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                                            <item.icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-medium group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">{item.title}</CardTitle>
                                            <CardDescription className="text-sm line-clamp-2 mt-0.5">{item.description}</CardDescription>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all mt-1" />
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Version Info */}
            <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                                <Palette className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">Ecclesia CMS</p>
                                <p className="text-sm text-slate-500">Version 1.0.0 • GNC AG Ejisu</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 rounded-full">
                            Up to date
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
