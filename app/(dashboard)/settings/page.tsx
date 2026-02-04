import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Bell, Shield, Database, Palette, ChevronRight, Building2, Key } from 'lucide-react'
import Link from 'next/link'

const settingsItems = [
    {
        icon: User,
        title: 'Profile',
        description: 'Update your account details and personal information',
        href: '/settings/profile',
        gradient: 'from-blue-500 to-indigo-600',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
        icon: Shield,
        title: 'Security',
        description: 'Password, two-factor authentication, and sessions',
        href: '/settings/security',
        gradient: 'from-green-500 to-emerald-600',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
        icon: Bell,
        title: 'Notifications',
        description: 'Configure email and push notification preferences',
        href: '/settings/notifications',
        gradient: 'from-amber-500 to-orange-500',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
        icon: Database,
        title: 'Data Management',
        description: 'Import from Google Sheets, backup and export',
        href: '/settings/data',
        gradient: 'from-violet-500 to-purple-600',
        bgColor: 'bg-violet-50 dark:bg-violet-900/20',
    },
    {
        icon: Building2,
        title: 'Church Profile',
        description: 'Church name, logo, and contact information',
        href: '/settings/church',
        gradient: 'from-cyan-500 to-blue-500',
        bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    },
    {
        icon: Key,
        title: 'API Keys',
        description: 'Manage SMS and integration credentials',
        href: '/settings/api',
        gradient: 'from-slate-600 to-slate-800',
        bgColor: 'bg-slate-100 dark:bg-slate-700',
    },
]

export default function SettingsPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">Settings</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account and system preferences</p>
            </div>

            {/* Settings Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {settingsItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full group cursor-pointer overflow-hidden">
                            <div className={`h-1.5 bg-gradient-to-r ${item.gradient}`} />
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-xl ${item.bgColor}`}>
                                            <item.icon className={`h-6 w-6 bg-gradient-to-br ${item.gradient} bg-clip-text text-transparent`} style={{ WebkitBackgroundClip: 'text' }} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.title}</CardTitle>
                                            <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Version Info */}
            <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <Palette className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">Ecclesia CMS</p>
                                <p className="text-sm text-slate-500">Version 1.0.0 • GNC AG Ejisu</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                            Up to date
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
