import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, Send, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react'
import Link from 'next/link'

export default function MessagesPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Messages</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Send SMS messages to members and groups
                    </p>
                </div>
                <Link href="/messages/new">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="h-4 w-4 mr-2" />
                        New Message
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            SMS Credits
                        </CardTitle>
                        <div className="p-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                            <MessageSquare className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">0</div>
                        <p className="text-xs text-slate-500 mt-1">Available balance</p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Sent (Month)
                        </CardTitle>
                        <div className="p-2 rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                            <Send className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">0</div>
                        <p className="text-xs text-slate-500 mt-1">Messages sent</p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Delivered
                        </CardTitle>
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <CheckCircle className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">0%</div>
                        <p className="text-xs text-slate-500 mt-1">Delivery rate</p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Scheduled
                        </CardTitle>
                        <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                            <Clock className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">0</div>
                        <p className="text-xs text-slate-500 mt-1">Pending delivery</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Messages */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader>
                    <CardTitle>Recent Messages</CardTitle>
                    <CardDescription>SMS messages sent in the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No messages sent yet</p>
                        <p className="text-sm mt-1">Send your first SMS to church members</p>
                        <Link href="/messages/new">
                            <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
                                <Send className="h-4 w-4 mr-2" />
                                Send First Message
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* SMS Provider Notice */}
            <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        <CardTitle className="text-amber-800 dark:text-amber-200">Arkesel SMS Integration</CardTitle>
                    </div>
                    <CardDescription className="text-amber-700 dark:text-amber-300">
                        SMS messages are sent via Arkesel. Ensure you have sufficient credits in your account.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    )
}
