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
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/settings">
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account</p>
                </div>
            </div>

            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-slate-400" />
                        Account Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={user?.email || ''} disabled className="bg-slate-100 dark:bg-slate-900" />
                    </div>
                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Input value="Administrator" disabled className="bg-slate-100 dark:bg-slate-900" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
