import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Users, Phone, CheckCircle, Clock, Plus } from 'lucide-react'
import Link from 'next/link'

export default function ShepherdingPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Shepherding</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Manage shepherd assignments and follow-ups
                    </p>
                </div>
                <Link href="/shepherding/follow-ups/new">
                    <Button className="bg-pink-600 hover:bg-pink-700">
                        <Plus className="h-4 w-4 mr-2" />
                        New Follow-up
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Active Shepherds
                        </CardTitle>
                        <div className="p-2 rounded-lg bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400">
                            <Heart className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">0</div>
                        <p className="text-xs text-slate-500 mt-1">Caring for members</p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Members Assigned
                        </CardTitle>
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <Users className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">0</div>
                        <p className="text-xs text-slate-500 mt-1">Under pastoral care</p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Pending Follow-ups
                        </CardTitle>
                        <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                            <Clock className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">0</div>
                        <p className="text-xs text-slate-500 mt-1">Scheduled</p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Completed (Month)
                        </CardTitle>
                        <div className="p-2 rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                            <CheckCircle className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">0</div>
                        <p className="text-xs text-slate-500 mt-1">Follow-ups done</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Links */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                    <Link href="/shepherding/shepherds">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-lg bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400">
                                    <Heart className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle>Shepherds</CardTitle>
                                    <CardDescription>View and manage shepherd assignments</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Link>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                    <Link href="/shepherding/follow-ups">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                    <Phone className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle>Follow-ups</CardTitle>
                                    <CardDescription>Schedule and track member follow-ups</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Link>
                </Card>
            </div>
        </div>
    )
}
