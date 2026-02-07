'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Shield, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import { assignMemberRole } from '@/app/actions/members'
import { Label } from '@/components/ui/label'

interface PromoteMemberModalProps {
    memberId: string
    memberName: string
    currentRole?: string
    trigger?: React.ReactNode
    onSuccess?: () => void
}

const ROLES = [
    { value: 'shepherd', label: 'Shepherd' },
    { value: 'dept_leader', label: 'Department Leader' },
    { value: 'admin', label: 'Admin / Office Manager' },
    { value: 'treasurer', label: 'Treasurer' },
    { value: 'pastor', label: 'Pastor' },
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'member', label: 'Member' },
]

export function PromoteMemberModal({ memberId, memberName, currentRole = 'member', trigger, onSuccess }: PromoteMemberModalProps) {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedRole, setSelectedRole] = useState<string>('shepherd')
    const router = useRouter()

    async function handlePromote() {
        setLoading(true)
        setError(null)

        // @ts-ignore
        const result = await assignMemberRole(memberId, selectedRole)

        if (result.success) {
            setSuccess(true)
            setTimeout(() => {
                router.refresh()
                onSuccess?.()
            }, 2000)
        } else {
            setError(result.error || 'Failed to promote member')
        }
        setLoading(false)
    }

    if (success) {
        return (
            <AlertDialog open={true}>
                <AlertDialogContent className="sm:max-w-sm">
                    <div className="flex flex-col items-center py-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                            Role Updated!
                        </h3>
                        <p className="text-sm text-slate-500 mb-2">
                            {memberName} is now a {ROLES.find(r => r.value === selectedRole)?.label}
                        </p>
                        <p className="text-xs text-slate-400">
                            SMS sent with login credentials.
                        </p>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        )
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        <Shield className="h-4 w-4 mr-2" />
                        Promote
                    </Button>
                )}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                            <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <AlertDialogTitle className="text-xl">Assign Role</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-base">
                        Change role for <span className="font-semibold text-slate-900 dark:text-white">{memberName}</span>.
                    </AlertDialogDescription>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="role">Select New Role</Label>
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROLES.map((role) => (
                                        <SelectItem key={role.value} value={role.value}>
                                            {role.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex gap-3 items-start">
                            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-800 dark:text-amber-300">
                                <p className="font-medium mb-1">Important:</p>
                                <ul className="list-disc list-inside space-y-1 text-xs opacity-90">
                                    <li>Member <strong>MUST</strong> have a valid email & phone.</li>
                                    <li>If no account exists, one will be created.</li>
                                    <li>Login details will be sent via SMS.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-2">
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            handlePromote()
                        }}
                        disabled={loading}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Confirm Change
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
