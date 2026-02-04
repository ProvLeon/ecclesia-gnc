'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, RefreshCw, CheckCircle, AlertCircle, FileSpreadsheet, Users, Wallet, CalendarCheck } from 'lucide-react'
import { syncMembersFromSheet, syncTithesFromSheet, syncAttendanceFromSheet, getAvailableSheets } from '@/app/actions/sync'

type SyncResult = { success: boolean; message: string; details?: string } | null

export default function DataSettingsPage() {
    const [sheets, setSheets] = useState<{ title: string }[]>([])
    const [selectedSheet, setSelectedSheet] = useState('Membership')
    const [isSyncing, setIsSyncing] = useState<string | null>(null)
    const [result, setResult] = useState<SyncResult>(null)

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
            })
        } catch (error) {
            setResult({ success: false, message: (error as Error).message })
        } finally {
            setIsSyncing(null)
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
                <div className={`flex items-start gap-3 p-4 rounded-lg ${result.success ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    }`}>
                    {result.success ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <div>
                        <p className="font-medium">{result.message}</p>
                        {result.details && <p className="text-sm opacity-80">{result.details}</p>}
                    </div>
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
