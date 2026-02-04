import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PlusCircle, FileText, ArrowLeft, Pencil, Trash2, MessageSquare } from 'lucide-react'
import { getSmsTemplates } from '@/app/actions/messages'
import { TemplateActions } from './template-actions'

const CATEGORY_COLORS: Record<string, string> = {
    reminder: 'bg-blue-100 text-blue-700',
    birthday: 'bg-pink-100 text-pink-700',
    event: 'bg-purple-100 text-purple-700',
    general: 'bg-slate-100 text-slate-700',
}

export default async function TemplatesPage() {
    const templates = await getSmsTemplates()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <Link href="/messages">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            SMS Templates
                        </h1>
                        <p className="text-sm text-slate-500">
                            Reusable message templates for quick sending
                        </p>
                    </div>
                </div>
                <Link href="/messages/templates/new">
                    <Button>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Template
                    </Button>
                </Link>
            </div>

            {/* Templates Grid */}
            {templates.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <FileText className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                            No templates yet
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Create your first template to speed up message sending
                        </p>
                        <Link href="/messages/templates/new">
                            <Button variant="outline">
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Create Template
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((template) => (
                        <Card key={template.id} className="hover:border-slate-300 transition-colors">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-base">{template.name}</CardTitle>
                                        <Badge
                                            variant="secondary"
                                            className={`mt-2 ${CATEGORY_COLORS[template.category] || CATEGORY_COLORS.general}`}
                                        >
                                            {template.category}
                                        </Badge>
                                    </div>
                                    <TemplateActions templateId={template.id} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                                    {template.content}
                                </p>
                                <div className="mt-4 flex items-center gap-2">
                                    <Link href={`/messages/compose?template=${template.id}`}>
                                        <Button size="sm" variant="outline">
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            Use Template
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
