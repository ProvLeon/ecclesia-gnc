import { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface DataTableCardProps {
  title: string
  description?: string
  icon?: LucideIcon
  columns: Array<{
    key: string
    label: string
    align?: 'left' | 'center' | 'right'
  }>
  rows: Array<Record<string, ReactNode>>
  className?: string
}

export function DataTableCard({
  title,
  description,
  icon: Icon,
  columns,
  rows,
  className = '',
}: DataTableCardProps) {
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  return (
    <Card className={`border-slate-200 dark:border-slate-700 ${className}`}>
      <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              <Icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
          )}
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`pb-3 px-4 font-semibold text-slate-700 dark:text-slate-300 ${alignmentClass[col.align || 'left']
                      }`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                  >
                    {columns.map((col) => (
                      <td
                        key={`${idx}-${col.key}`}
                        className={`py-3 px-4 text-slate-600 dark:text-slate-400 ${alignmentClass[col.align || 'left']
                          }`}
                      >
                        {row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-8 px-4 text-center text-slate-500 dark:text-slate-400"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
