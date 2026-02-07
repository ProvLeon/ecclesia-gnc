import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Users, Bell, Shield, Database, ChevronRight, Building2, Key, Palette, ArrowRight, Lock, Zap } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const settingsCategories = [
  {
    id: 'account',
    title: 'Account Settings',
    description: 'Manage your personal account',
    icon: User,
    color: 'blue',
    items: [
      {
        icon: User,
        title: 'Profile',
        description: 'Update your account details and personal information',
        href: '/settings/profile',
      },
      {
        icon: Shield,
        title: 'Security',
        description: 'Password, two-factor authentication, and sessions',
        href: '/settings/security',
      },
    ],
  },
  {
    id: 'organization',
    title: 'Organization',
    description: 'Church settings and configuration',
    icon: Building2,
    color: 'green',
    items: [
      {
        icon: Building2,
        title: 'Church Profile',
        description: 'Church name, logo, and contact information',
        href: '/settings/church',
      },
      {
        icon: Users,
        title: 'User Management',
        description: 'Manage system users, roles and permissions',
        href: '/settings/users',
      },
    ],
  },
  {
    id: 'communications',
    title: 'Communications',
    description: 'Notifications and messaging',
    icon: Bell,
    color: 'purple',
    items: [
      {
        icon: Bell,
        title: 'Notifications',
        description: 'Configure email and push notification preferences',
        href: '/settings/notifications',
      },
      {
        icon: Key,
        title: 'API Keys',
        description: 'Manage SMS and integration credentials',
        href: '/settings/api',
      },
    ],
  },
  {
    id: 'data',
    title: 'Data Management',
    description: 'Import, backup, and export data',
    icon: Database,
    color: 'amber',
    items: [
      {
        icon: Database,
        title: 'Data Management',
        description: 'Import from Google Sheets, backup and export',
        href: '/settings/data',
      },
    ],
  },
]

const colorClasses = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 dark:bg-blue-900/30'
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-600 dark:text-green-400',
    badge: 'bg-green-100 dark:bg-green-900/30'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    icon: 'text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-100 dark:bg-purple-900/30'
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-100 dark:bg-amber-900/30'
  },
}

import { protectPage } from '@/lib/auth/proxy'

export default async function SettingsPage() {
  await protectPage('settings:view')

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-600 dark:text-slate-300">Manage your account and system preferences</p>
      </div>

      {/* Settings Categories */}
      <div className="space-y-6">
        {settingsCategories.map((category) => {
          const colors = colorClasses[category.color as keyof typeof colorClasses]
          const CategoryIcon = category.icon

          return (
            <div key={category.id} className="space-y-3">
              {/* Category Header */}
              <div className="flex items-center gap-3 px-1">
                <div className={`p-2 rounded-lg ${colors.badge}`}>
                  <CategoryIcon className={`h-5 w-5 ${colors.icon}`} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{category.title}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{category.description}</p>
                </div>
              </div>

              {/* Category Items */}
              <div className="grid gap-3 md:grid-cols-2">
                {category.items.map((item) => {
                  const ItemIcon = item.icon
                  return (
                    <Link key={item.href} href={item.href} className="group">
                      <Card className="border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 h-full overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="pt-5 pb-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2.5 rounded-lg ${colors.badge} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                              <ItemIcon className={`h-5 w-5 ${colors.icon}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {item.title}
                              </h3>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {item.description}
                              </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Version and Status Info */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-r from-green-50 to-transparent dark:from-green-900/10 dark:to-transparent">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Ecclesia CMS</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Version 1.0.0 • GNC AG Ejisu</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                Up to date
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/10 dark:to-transparent">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 dark:text-white">Security Tip</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Keep your account secure by enabling two-factor authentication and regularly updating your password.
                </p>
                <Link href="/settings/security">
                  <Button variant="outline" size="sm" className="mt-3 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    Enable 2FA <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
