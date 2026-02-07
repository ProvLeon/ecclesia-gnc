'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Lock, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export function ChangePasswordForm() {
    const [loading, setLoading] = useState(false)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    async function handleUpdatePassword(e: React.FormEvent) {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        setLoading(true)
        const supabase = createClient()

        const { error } = await supabase.auth.updateUser({
            password: password
        })

        setLoading(false)

        if (error) {
            toast.error(error.message)
        } else {
            toast.success('Password updated successfully')
            setPassword('')
            setConfirmPassword('')
        }
    }

    return (
        <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Lock className="h-5 w-5 text-slate-500" />
                    Security
                </CardTitle>
                <CardDescription>
                    Update your password to keep your account secure.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdatePassword}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                            id="new-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min. 6 characters"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter new password"
                            required
                        />
                    </div>
                </CardContent>
                <CardFooter className="border-t border-slate-100 dark:border-slate-800 pt-6">
                    <Button
                        type="submit"
                        disabled={loading || !password || !confirmPassword}
                        className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                    >
                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Update Password
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
