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
import { Shield, Loader2, CheckCircle } from 'lucide-react'
import { promoteToShepherd } from '@/app/actions/shepherding'

interface PromoteToShepherdModalProps {
    memberId: string
    memberName: string
    trigger?: React.ReactNode
    onSuccess?: () => void
}

export function PromoteToShepherdModal({ memberId, memberName, trigger, onSuccess }: PromoteToShepherdModalProps) {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    async function handlePromote() {
        setLoading(true)
        setError(null)

        const result = await promoteToShepherd(memberId)

        if (result.success) {
            setSuccess(true)
            setTimeout(() => {
                router.refresh()
                onSuccess?.()
            }, 1500)
        } else {
            setError(result.error || 'Failed to promote')
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
                            Promoted Successfully!
                        </h3>
                        <p className="text-sm text-slate-500">
                            {memberName} is now a shepherd
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
                        Make Shepherd
                    </Button>
                )}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                            <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <AlertDialogTitle className="text-xl">Promote to Shepherd</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-base">
                        You are about to promote <span className="font-semibold text-slate-900 dark:text-white">{memberName}</span> to a shepherd role.
                    </AlertDialogDescription>
                    <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            As a shepherd, they will be able to:
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                Have members assigned to them
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                Conduct follow-ups and visits
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                Track pastoral care activities
                            </li>
                        </ul>
                    </div>
                    {error && (
                        <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-4">
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handlePromote}
                        disabled={loading}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                    >
                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Promote to Shepherd
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
