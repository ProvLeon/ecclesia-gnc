'use client'

import { useState, useCallback } from 'react'

interface UsePaginationOptions {
  initialPage?: number
  pageSize?: number
}

export function usePagination(options?: UsePaginationOptions) {
  const [page, setPage] = useState(options?.initialPage ?? 1)
  const [total, setTotal] = useState(0)

  const pageSize = options?.pageSize ?? 10
  const totalPages = Math.ceil(total / pageSize)

  const goToPage = useCallback((newPage: number) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages || 1))
    setPage(validPage)
  }, [totalPages])

  const nextPage = useCallback(() => {
    goToPage(page + 1)
  }, [page, goToPage])

  const prevPage = useCallback(() => {
    goToPage(page - 1)
  }, [page, goToPage])

  const reset = useCallback(() => {
    setPage(options?.initialPage ?? 1)
  }, [options?.initialPage])

  const canGoNext = page < totalPages
  const canGoPrev = page > 1

  return {
    page,
    pageSize,
    total,
    setTotal,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    reset,
    canGoNext,
    canGoPrev,
    hasNextPage: canGoNext,
    hasPrevPage: canGoPrev,
    offset: (page - 1) * pageSize,
  }
}
