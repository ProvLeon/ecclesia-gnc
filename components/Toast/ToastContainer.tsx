'use client'

import React from 'react'
import { useNotification, type Toast } from '@/contexts/NotificationContext'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const colorClassMap = {
  success: 'text-green-600 dark:text-green-400',
  error: 'text-red-600 dark:text-red-400',
  warning: 'text-amber-600 dark:text-amber-400',
  info: 'text-blue-600 dark:text-blue-400',
}

interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const Icon = iconMap[toast.type]
  const colorClass = colorClassMap[toast.type]

  // Animation: animate-in fade-in slide-in-from-bottom-5 duration-300
  // Background: white in light, slate-800 in dark
  // Border: slate-200 in light, slate-700 in dark
  // Shadow: shadow-lg

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-lg bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 shadow-lg animate-in fade-in slide-in-from-bottom-5 duration-300"
      role="alert"
      aria-live="polite"
    >
      <Icon
        className={`h-5 w-5 flex-shrink-0 mt-0.5 ${colorClass}`}
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
            className={`text-sm font-medium mt-2 hover:underline ${colorClass}`}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        aria-label="Close notification"
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
