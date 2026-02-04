'use client'

import { useCallback, useEffect, useReducer } from 'react'

type Status = 'idle' | 'pending' | 'success' | 'error'

interface State<T> {
  status: Status
  data: T | null
  error: Error | null
}

type Action<T> =
  | { type: 'PENDING' }
  | { type: 'SUCCESS'; payload: T }
  | { type: 'ERROR'; payload: Error }
  | { type: 'RESET' }

function reducer<T>(state: State<T>, action: Action<T>): State<T> {
  switch (action.type) {
    case 'PENDING':
      return { status: 'pending', data: null, error: null }
    case 'SUCCESS':
      return { status: 'success', data: action.payload, error: null }
    case 'ERROR':
      return { status: 'error', data: null, error: action.payload }
    case 'RESET':
      return { status: 'idle', data: null, error: null }
    default:
      return state
  }
}

interface UseAsyncOptions {
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  onSettled?: () => void
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true,
  options?: UseAsyncOptions
) {
  const [state, dispatch] = useReducer(reducer<T>, {
    status: 'idle',
    data: null,
    error: null,
  })

  const execute = useCallback(async () => {
    dispatch({ type: 'PENDING' })
    try {
      const response = await asyncFunction()
      dispatch({ type: 'SUCCESS', payload: response })
      options?.onSuccess?.(response)
      return response
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      dispatch({ type: 'ERROR', payload: err })
      options?.onError?.(err)
      throw err
    } finally {
      options?.onSettled?.()
    }
  }, [asyncFunction, options])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  return {
    ...state,
    execute,
    reset,
    isLoading: state.status === 'pending',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
  }
}
