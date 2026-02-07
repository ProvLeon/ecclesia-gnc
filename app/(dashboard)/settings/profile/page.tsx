import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, User } from 'lucide-react'
import Link from 'next/link'
import { getUser } from '@/app/actions/auth'

export default async function ProfileSettingsPage() {
    const user = await getUser()

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-4">
                <Link href="/settings">
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account and security</p>
                </div>
            </div>

            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="h-5 w-5 text-slate-500" />
                        Account Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-500">
                            {user?.email?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-medium text-slate-900 dark:text-white">Current Session</p>
                            <p className="text-sm text-slate-500">Logged in as {user?.email}</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input value={user?.email || ''} disabled className="bg-slate-50 dark:bg-slate-900/50" />
                    </div>
                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Input value={user?.app_metadata?.role || user?.user_metadata?.role || 'User'} disabled className="bg-slate-50 dark:bg-slate-900/50 capitalize" />
                    </div>
                </CardContent>
            </Card>

            <ChangePasswordForm />
        </div>
    )
}

import { ChangePasswordForm } from './change-password-form'
