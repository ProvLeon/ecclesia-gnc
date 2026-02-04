import { Card, CardContent } from '@/components/ui/card'

interface ReportFooterProps {
  reportType: string
  generatedDate?: Date
  dataSource?: string
  period?: string
}

export function ReportFooter({
  reportType,
  generatedDate = new Date(),
  dataSource,
  period,
}: ReportFooterProps) {
  return (
    <Card className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
      <CardContent className="pt-6">
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-600 dark:text-slate-400 text-xs uppercase font-semibold tracking-wider">
              Report Type
            </p>
            <p className="text-slate-900 dark:text-white font-medium mt-1">{reportType}</p>
          </div>
          <div>
            <p className="text-slate-600 dark:text-slate-400 text-xs uppercase font-semibold tracking-wider">
              Generated
            </p>
            <p className="text-slate-900 dark:text-white font-medium mt-1">
              {generatedDate.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-slate-600 dark:text-slate-400 text-xs uppercase font-semibold tracking-wider">
              {period ? 'Period' : 'Data Source'}
            </p>
            <p className="text-slate-900 dark:text-white font-medium mt-1">
              {period || dataSource || 'Real-time data'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
