import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download } from 'lucide-react'

interface ReportHeaderProps {
  title: string
  description: string
  onExport?: () => void
  exportLabel?: string
}

export function ReportHeader({
  title,
  description,
  onExport,
  exportLabel = 'Export PDF',
}: ReportHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-4">
        <Link href="/reports">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {description}
          </p>
        </div>
      </div>
      {onExport && (
        <Button
          onClick={onExport}
          className="gap-2 bg-primary dark:bg-accent hover:opacity-90 text-primary-foreground dark:text-primary w-full sm:w-auto"
        >
          <Download className="h-4 w-4" />
          {exportLabel}
        </Button>
      )}
    </div>
  )
}
