'use client'

import React from 'react'
import { useNotification, type Toast } from '@/contexts/NotificationContext'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { colors, transitions, animations, spacing } from '@/lib/design/tokens'

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const colorMap = {
  success: colors.success[600],
  error: colors.error[600],
  warning: colors.warning[600],
  info: colors.primary[600],
}

interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const Icon = iconMap[toast.type]
  const iconColor = colorMap[toast.type]

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-lg bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 shadow-lg"
      role="alert"
      aria-live="polite"
      style={{
        animation: `slideInUp ${animations.slideInUp.duration} ${animations.slideInUp.timing}`,
      }}
    >
      <Icon
        className="h-5 w-5 flex-shrink-0 mt-0.5"
        style={{ color: iconColor }}
        aria-hidden="true"
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          {toast.title}
        </p>
        {toast.message && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {toast.message}
          </p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="text-sm font-medium mt-2 hover:underline"
            style={{ color: iconColor }}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        aria-label="Close notification"
        style={{
          transition: `color ${transitions.base} ${transitions.timing.ease}`,
        }}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const { toasts, remove } = useNotification()

  if (toasts.length === 0) {
    return null
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      style={{
        maxWidth: 'min(100%, 400px)',
      }}
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={remove} />
        </div>
      ))}
    </div>
  )
}
