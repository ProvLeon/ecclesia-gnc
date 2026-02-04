'use client'

import { useState, useEffect } from 'react'

interface UseDebounceOptions {
  delay?: number
}

export function useDebounce<T>(value: T, options?: UseDebounceOptions): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const delay = options?.delay ?? 500

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
