import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Users, Search, ArrowLeft, Download, Phone, Mail, Calendar } from 'lucide-react'
import { db } from '@/lib/db'
import { members } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

async function getAllMembers() {
    return db
        .select({
            id: members.id,
            firstName: members.firstName,
            lastName: members.lastName,
            email: members.email,
            phone: members.phonePrimary,
            status: members.memberStatus,
            joinDate: members.joinDate,
        })
        .from(members)
        .where(eq(members.memberStatus, 'active'))
        .orderBy(asc(members.firstName))
}

export default async function MembersReportPage() {
    const memberList = await getAllMembers()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <Link href="/reports">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Member Directory</h1>
                        <p className="text-slate-500 dark:text-slate-400">Complete list of active members</p>
                    </div>
                </div>
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />Export CSV
                </Button>
            </div>

            {/* Summary */}
            <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <CardContent className="py-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                            <Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                            <p className="font-medium text-slate-900 dark:text-white">{memberList.length} Active Members</p>
                            <p className="text-sm text-slate-500">Report generated {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search members..."
                    className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                />
            </div>

            {/* Members List */}
            <Card className="border-slate-200 dark:border-slate-700">
                <CardContent className="pt-5">
                    {memberList.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                            <p>No members found</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {memberList.map((m) => (
                                <div
                                    key={m.id}
                                    className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm">
                                                {m.firstName?.[0]}{m.lastName?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm text-slate-900 dark:text-white">
                                                {m.firstName} {m.lastName}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                {m.phone && <span>{m.phone}</span>}
                                                {m.email && <span>• {m.email}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {m.joinDate ? new Date(m.joinDate).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
