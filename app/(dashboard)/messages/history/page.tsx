import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { MessageSquare, Search, ArrowLeft, Check, X, Clock } from 'lucide-react'
import { getMessages } from '@/app/actions/messages'
import { format } from 'date-fns'

interface PageProps {
    searchParams: Promise<{ page?: string }>
}

export default async function MessageHistoryPage({ searchParams }: PageProps) {
    const params = await searchParams
    const page = parseInt(params.page || '1', 10)
    const { data: messages } = await getMessages(page, 20)

    // Calculate simple pagination
    const totalPages = Math.max(1, Math.ceil(messages.length / 20))
    const pagination = { page, total: messages.length, totalPages }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <Link href="/messages">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Message History</h1>
                        <p className="text-slate-500 dark:text-slate-400">All sent messages</p>
                    </div>
                </div>
                <Link href="/messages/compose">
                    <Button>New Message</Button>
                </Link>
            </div>

            {/* Search */}
            <Card className="border-slate-200 dark:border-slate-700">
                <CardContent className="pt-5">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search messages..."
                            className="pl-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Messages List */}
            <Card className="border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                            <MessageSquare className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-medium">All Messages</CardTitle>
                            <CardDescription>{pagination.total} total messages</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    {messages.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-50" />
                            <p className="font-medium">No messages yet</p>
                            <p className="text-sm mt-1">Start by sending your first message</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {messages.map((m) => (
                                <div
                                    key={m.id}
                                    className="flex items-start justify-between p-4 -mx-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-900 dark:text-white">
                                            {m.messageText.slice(0, 100)}{m.messageText.length > 100 ? '...' : ''}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                            <Badge variant="outline" className="py-0 h-5">{m.recipientType || 'Individual'}</Badge>
                                            <span>{m.totalRecipients || 0} recipients</span>
                                            <span className="text-slate-400">
                                                {m.successfulSends || 0} sent • {m.failedSends || 0} failed
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 ml-4">
                                        <Badge
                                            variant="outline"
                                            className={
                                                m.status === 'sent'
                                                    ? 'bg-green-50 text-green-700 border-green-200'
                                                    : m.status === 'failed'
                                                        ? 'bg-red-50 text-red-700 border-red-200'
                                                        : 'bg-slate-50 text-slate-600 border-slate-200'
                                            }
                                        >
                                            {m.status === 'sent' && <Check className="h-3 w-3 mr-1" />}
                                            {m.status === 'failed' && <X className="h-3 w-3 mr-1" />}
                                            {m.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                                            {m.status}
                                        </Badge>
                                        <span className="text-xs text-slate-400">
                                            {m.createdAt && format(new Date(m.createdAt), 'MMM d, h:mm a')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-sm text-slate-500">
                                Page {pagination.page} of {pagination.totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Link href={`/messages/history?page=${Math.max(1, page - 1)}`}>
                                    <Button variant="outline" size="sm" disabled={page <= 1}>Previous</Button>
                                </Link>
                                <Link href={`/messages/history?page=${Math.min(pagination.totalPages, page + 1)}`}>
                                    <Button variant="outline" size="sm" disabled={page >= pagination.totalPages}>Next</Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
