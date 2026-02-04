'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: (error: Error, retry: () => void) => ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorCount: number
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState((prevState) => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }))

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo)
    }

    // Log to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to Sentry or similar service
      console.error('Error:', error)
    }
  }

  retry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.retry)
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
          <div className="max-w-md w-full">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </div>

              {/* Error Message */}
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-2">
                Oops! Something went wrong
              </h1>

              <p className="text-slate-600 dark:text-slate-400 text-center text-sm mb-6">
                We encountered an unexpected error. Try refreshing the page or go back to the home page.
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg">
                  <p className="text-xs font-mono text-red-800 dark:text-red-200 break-all">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-3 cursor-pointer">
                      <summary className="text-xs font-medium text-red-700 dark:text-red-300 hover:underline">
                        Stack trace
                      </summary>
                      <pre className="mt-2 text-xs overflow-auto text-red-700 dark:text-red-300 whitespace-pre-wrap break-words max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={this.retry}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  aria-label="Try again"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </button>

                <Link
                  href="/"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium rounded-lg transition-colors"
                  aria-label="Go to home page"
                >
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </div>

              {/* Error ID for Support */}
              {process.env.NODE_ENV === 'production' && (
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-6">
                  Error ID: {Date.now()}
                </p>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
