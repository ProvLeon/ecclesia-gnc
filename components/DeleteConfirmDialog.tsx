'use client'

import * as React from 'react'
import { AlertCircle, Loader2, X, Check } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  itemName?: string
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
  isDangerous?: boolean
  confirmText?: string
  cancelText?: string
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  itemName,
  onConfirm,
  isLoading = false,
  isDangerous = false,
  confirmText = 'Delete',
  cancelText = 'Cancel',
}: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="flex flex-row items-start gap-3">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
          </div>
          <div className="flex-1">
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
        </AlertDialogHeader>

        <AlertDialogDescription className="text-sm">
          {description}
          {itemName && (
            <div className="mt-3 p-2 bg-muted rounded-md">
              <p className="font-mono text-xs break-all">{itemName}</p>
            </div>
          )}
        </AlertDialogDescription>

        {isDangerous && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-sm text-destructive">
              This action cannot be undone.
            </p>
          </div>
        )}

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel asChild>
            <Button
              variant="outline"
              disabled={isLoading || isDeleting}
            >
              {cancelText}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction
            asChild
            onClick={(e) => {
              e.preventDefault()
              handleConfirm()
            }}
          >
            <Button
              variant={isDangerous ? 'destructive' : 'default'}
              disabled={isLoading || isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmText}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
