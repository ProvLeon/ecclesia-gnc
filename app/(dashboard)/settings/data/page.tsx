'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, RefreshCw, CheckCircle, AlertCircle, FileSpreadsheet, Users, Wallet, CalendarCheck } from 'lucide-react'
import { syncMembersFromSheet, syncTithesFromSheet, syncAttendanceFromSheet, getAvailableSheets, resolveSkippedEntry } from '@/app/actions/sync'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

type SkippedEntry = {
    row: number
    name: string
    phone: string
    reason: string
    existingMember?: string
    existingMemberId?: string
    rawData?: any
}

type SyncResult = {
    success: boolean;
    message: string;
    details?: string;
    skippedEntries?: SkippedEntry[]
} | null

export default function DataSettingsPage() {
    const [sheets, setSheets] = useState<{ title: string }[]>([])
    const [selectedSheet, setSelectedSheet] = useState('Membership')
    const [isSyncing, setIsSyncing] = useState<string | null>(null)
    const [result, setResult] = useState<SyncResult>(null)
    const [resolvingId, setResolvingId] = useState<number | null>(null)

    useEffect(() => {
        getAvailableSheets().then((res) => {
            if (res.success && res.sheets) {
                setSheets(res.sheets)
            }
        })
    }, [])

    async function handleSyncMembers() {
        setIsSyncing('members')
        setResult(null)
        try {
            const res = await syncMembersFromSheet(selectedSheet)
            setResult({
                success: res.success,
                message: res.success ? `Imported ${res.imported} members` : res.error || 'Failed',
                details: res.skipped ? `Skipped ${res.skipped} rows` : undefined,
                skippedEntries: res.skippedEntries
            })
            if (res.skippedEntries && res.skippedEntries.length > 0) {
                toast.warning(`Import completed with ${res.skippedEntries.length} skipped entries. Please review below.`)
            } else if (res.success) {
                toast.success(`Successfully imported ${res.imported} members`)
            }
        } catch (error) {
            setResult({ success: false, message: (error as Error).message })
        } finally {
            setIsSyncing(null)
        }
    }

    async function handleResolve(entry: SkippedEntry, action: 'overwrite' | 'create' | 'dismiss') {
        if (action === 'dismiss') {
            setResult(prev => prev ? ({
                ...prev,
                skippedEntries: prev.skippedEntries?.filter(e => e.row !== entry.row)
            }) : null)
            return
        }

        setResolvingId(entry.row)
        try {
            const res = await resolveSkippedEntry({
                action,
                existingMemberId: entry.existingMemberId,
                rawData: entry.rawData
            })

            if (res.success) {
                toast.success(res.message)
                // Remove from list
                setResult(prev => prev ? ({
                    ...prev,
                    skippedEntries: prev.skippedEntries?.filter(e => e.row !== entry.row)
                }) : null)
            } else {
                toast.error(res.error || 'Failed to resolve entry')
            }
        } catch (error) {
            toast.error('An error occurred during resolution')
        } finally {
            setResolvingId(null)
        }
    }

    async function handleSyncTithes() {
        setIsSyncing('tithes')
        setResult(null)
        try {
            const res = await syncTithesFromSheet()
            setResult({
                success: res.success,
                message: res.success ? `Imported ${res.imported} tithe records` : res.error || 'Failed',
                details: res.skipped ? `Skipped ${res.skipped} members` : undefined,
            })
        } catch (error) {
            setResult({ success: false, message: (error as Error).message })
        } finally {
            setIsSyncing(null)
        }
    }

    async function handleSyncAttendance() {
        setIsSyncing('attendance')
        setResult(null)
        try {
            const res = await syncAttendanceFromSheet()
            setResult({
                success: res.success,
                message: res.success ? `Imported ${res.imported} attendance records` : res.error || 'Failed',
                details: res.success && res.servicesCreated ? `Created ${res.servicesCreated} new services` : undefined,
            })
        } catch (error) {
            setResult({ success: false, message: (error as Error).message })
        } finally {
            setIsSyncing(null)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/settings">
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Data Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Import data from Google Sheets</p>
                </div>
            </div>

            {result && (
                <div className="space-y-4">
                    <div className={`flex items-start gap-3 p-4 rounded-lg ${result.success ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        }`}>
                        {result.success ? <CheckCircle className="h-5 w-5 mt-0.5" /> : <AlertCircle className="h-5 w-5 mt-0.5" />}
                        <div>
                            <p className="font-medium">{result.message}</p>
                            {result.details && <p className="text-sm opacity-80">{result.details}</p>}
                        </div>
                    </div>

                    {/* Skipped Entries Log - Grouped */}
                    {result.skippedEntries && result.skippedEntries.length > 0 && (
                        <div className="space-y-6">
                            {/* Duplicates */}
                            {result.skippedEntries.some(e => e.reason.includes('Duplicate')) && (
                                <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                            <Users className="h-5 w-5" />
                                            <CardTitle className="text-base">Duplicates ({result.skippedEntries.filter(e => e.reason.includes('Duplicate')).length})</CardTitle>
                                        </div>
                                        <CardDescription>Potential duplicate members found. Review and decide to overwrite or create.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <EntriesTable
                                            entries={result.skippedEntries.filter(e => e.reason.includes('Duplicate'))}
                                            handleResolve={handleResolve}
                                            resolvingId={resolvingId}
                                        />
                                    </CardContent>
                                </Card>
                            )}

                            {/* Invalid Data */}
                            {result.skippedEntries.some(e => e.reason.includes('Invalid') || e.reason.includes('Missing')) && (
                                <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                                            <AlertCircle className="h-5 w-5" />
                                            <CardTitle className="text-base">Invalid Data ({result.skippedEntries.filter(e => e.reason.includes('Invalid') || e.reason.includes('Missing')).length})</CardTitle>
                                        </div>
                                        <CardDescription>Rows with missing or invalid data. Fix in Google Sheets and re-sync.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <EntriesTable
                                            entries={result.skippedEntries.filter(e => e.reason.includes('Invalid') || e.reason.includes('Missing'))}
                                            handleResolve={handleResolve}
                                            resolvingId={resolvingId}
                                            forceCreateOnly
                                        />
                                    </CardContent>
                                </Card>
                            )}

                            {/* Other Errors */}
                            {result.skippedEntries.some(e => !e.reason.includes('Duplicate') && !e.reason.includes('Invalid') && !e.reason.includes('Missing')) && (
                                <Card className="border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-400">
                                            <AlertCircle className="h-5 w-5" />
                                            <CardTitle className="text-base">Other Errors ({result.skippedEntries.filter(e => !e.reason.includes('Duplicate') && !e.reason.includes('Invalid') && !e.reason.includes('Missing')).length})</CardTitle>
                                        </div>
                                        <CardDescription>Unexpected errors during processing.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <EntriesTable
                                            entries={result.skippedEntries.filter(e => !e.reason.includes('Duplicate') && !e.reason.includes('Invalid') && !e.reason.includes('Missing'))}
                                            handleResolve={handleResolve}
                                            resolvingId={resolvingId}
                                            forceCreateOnly
                                        />
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Sync Members */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle>Sync Members</CardTitle>
                            <CardDescription>Import members from Church Database</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Select value={selectedSheet} onValueChange={setSelectedSheet}>
                            <SelectTrigger className="w-full sm:w-[250px]">
                                <SelectValue placeholder="Select sheet" />
                            </SelectTrigger>
                            <SelectContent>
                                {sheets.map((s) => (
                                    <SelectItem key={s.title} value={s.title}>{s.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleSyncMembers} disabled={isSyncing !== null} className="bg-blue-600 hover:bg-blue-700">
                            {isSyncing === 'members' ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Syncing...</>
                                : <><RefreshCw className="h-4 w-4 mr-2" />Sync Members</>}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Sync Tithes */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                            <Wallet className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle>Sync Tithes</CardTitle>
                            <CardDescription>Import tithe records from Tithes sheet</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleSyncTithes} disabled={isSyncing !== null} className="bg-green-600 hover:bg-green-700">
                        {isSyncing === 'tithes' ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Syncing...</>
                            : <><RefreshCw className="h-4 w-4 mr-2" />Sync Tithes</>}
                    </Button>
                </CardContent>
            </Card>

            {/* Sync Attendance */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                            <CalendarCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle>Sync Attendance</CardTitle>
                            <CardDescription>Import attendance records from Attendance sheet</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleSyncAttendance} disabled={isSyncing !== null} className="bg-amber-600 hover:bg-amber-700">
                        {isSyncing === 'attendance' ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Syncing...</>
                            : <><RefreshCw className="h-4 w-4 mr-2" />Sync Attendance</>}
                    </Button>
                </CardContent>
            </Card>

            {/* Available Sheets */}
            <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-slate-400" />
                        <CardTitle className="text-base">Available Sheets</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {sheets.length === 0 ? (
                            <p className="text-sm text-slate-500">Loading sheets...</p>
                        ) : (
                            sheets.map((s) => (
                                <span key={s.title} className="px-2 py-1 bg-white dark:bg-slate-700 rounded text-sm border">
                                    {s.title}
                                </span>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function EntriesTable({
    entries,
    handleResolve,
    resolvingId,
    forceCreateOnly = false
}: {
    entries: SkippedEntry[],
    handleResolve: (entry: SkippedEntry, action: 'overwrite' | 'create' | 'dismiss') => void,
    resolvingId: number | null,
    forceCreateOnly?: boolean
}) {
    return (
        <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 dark:bg-slate-900/30 text-slate-900 dark:text-slate-100 uppercase text-xs font-medium">
                        <tr>
                            <th className="px-4 py-3">Row</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3">Issue</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                        {entries.map((entry, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-4 py-3 font-medium">{entry.row}</td>
                                <td className="px-4 py-3">{entry.name}</td>
                                <td className="px-4 py-3 text-slate-500">{entry.phone}</td>
                                <td className="px-4 py-3 text-red-600 dark:text-red-400 max-w-[300px]">{entry.reason}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        {!forceCreateOnly && entry.existingMemberId ? (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-xs border-amber-300 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-900/20"
                                                    onClick={() => handleResolve(entry, 'overwrite')}
                                                    disabled={resolvingId === entry.row}
                                                >
                                                    {resolvingId === entry.row ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Overwrite'}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-xs"
                                                    onClick={() => handleResolve(entry, 'create')}
                                                    disabled={resolvingId === entry.row}
                                                >
                                                    Create Duplicate
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-xs"
                                                onClick={() => handleResolve(entry, 'create')}
                                                disabled={resolvingId === entry.row}
                                            >
                                                {resolvingId === entry.row ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Force Create'}
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600"
                                            onClick={() => handleResolve(entry, 'dismiss')}
                                            disabled={resolvingId === entry.row}
                                        >
                                            <span className="sr-only">Dismiss</span>
                                            &times;
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
