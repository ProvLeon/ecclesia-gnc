'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationContextType {
  toasts: Toast[]
  notify: (toast: Omit<Toast, 'id'>) => string
  success: (title: string, message?: string) => string
  error: (title: string, message?: string) => string
  warning: (title: string, message?: string) => string
  info: (title: string, message?: string) => string
  remove: (id: string) => void
  clear: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const notify = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    }

    setToasts((prev) => [...prev, newToast])

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, newToast.duration)
    }

    return id
  }, [])

  const success = useCallback(
    (title: string, message?: string) =>
      notify({
        type: 'success',
        title,
        message,
      }),
    [notify]
  )

  const error = useCallback(
    (title: string, message?: string) =>
      notify({
        type: 'error',
        title,
        message,
        duration: 7000, // Errors stay longer
      }),
    [notify]
  )

  const warning = useCallback(
    (title: string, message?: string) =>
      notify({
        type: 'warning',
        title,
        message,
        duration: 6000,
      }),
    [notify]
  )

  const info = useCallback(
    (title: string, message?: string) =>
      notify({
        type: 'info',
        title,
        message,
      }),
    [notify]
  )

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const clear = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        toasts,
        notify,
        success,
        error,
        warning,
        info,
        remove,
        clear,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}
