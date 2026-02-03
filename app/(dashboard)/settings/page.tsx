import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, User, Bell, Shield, Database, Palette } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Manage system preferences</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <SettingCard
                    icon={User}
                    title="Profile"
                    description="Update your account details"
                    href="/settings/profile"
                    color="blue"
                />
                <SettingCard
                    icon={Bell}
                    title="Notifications"
                    description="Configure notification preferences"
                    href="/settings/notifications"
                    color="amber"
                />
                <SettingCard
                    icon={Shield}
                    title="Security"
                    description="Password and security settings"
                    href="/settings/security"
                    color="green"
                />
                <SettingCard
                    icon={Database}
                    title="Data Management"
                    description="Backup and export options"
                    href="/settings/data"
                    color="purple"
                />
            </div>
        </div>
    )
}

function SettingCard({ icon: Icon, title, description, href, color }: {
    icon: React.ElementType
    title: string
    description: string
    href: string
    color: 'blue' | 'amber' | 'green' | 'purple'
}) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
        green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    }

    return (
        <Link href={href}>
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${colors[color]}`}>
                            <Icon className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>
        </Link>
    )
}
