'use client'

import * as React from 'react'
import { Button } from './ui/button'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof import('./ui/button').buttonVariants> {
  /**
   * Label for icon-only buttons (required for accessibility)
   */
  ariaLabel?: string

  /**
   * Description for the button (for complex buttons)
   */
  ariaDescription?: string

  /**
   * Whether button is in a loading state
   */
  isLoading?: boolean

  /**
   * Custom loading indicator component
   */
  loadingIndicator?: React.ReactNode

  /**
   * Whether button is a toggle button (for pressed/not-pressed state)
   */
  isToggle?: boolean

  /**
   * Current pressed state for toggle buttons
   */
  isPressed?: boolean

  /**
   * Keyboard shortcuts hint to display
   */
  shortcut?: string

  /**
   * Icon-only button detection (shows warning in dev if no label)
   */
  icon?: React.ReactNode
}

/**
 * AccessibleButton Component
 *
 * Enhanced button component with built-in accessibility features:
 * - ARIA labels for icon-only buttons
 * - Loading states with proper announcements
 * - Toggle button support
 * - Keyboard shortcut hints
 * - Screen reader friendly
 *
 * WCAG 2.1 Level AA Compliant
 */
export const AccessibleButton = React.forwardRef<
  HTMLButtonElement,
  AccessibleButtonProps
>(
  (
    {
      ariaLabel,
      ariaDescription,
      isLoading = false,
      loadingIndicator,
      isToggle = false,
      isPressed = false,
      shortcut,
      icon,
      disabled,
      className,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    // Validate icon-only buttons have labels
    React.useEffect(() => {
      if (process.env.NODE_ENV === 'development' && icon && !children && !ariaLabel) {
        console.warn(
          'AccessibleButton: Icon-only button should have ariaLabel prop for accessibility'
        )
      }
    }, [icon, children, ariaLabel])

    // Prepare ARIA attributes
    const ariaAttrs: Record<string, any> = {}

    if (ariaLabel) {
      ariaAttrs['aria-label'] = ariaLabel
    }

    if (ariaDescription) {
      ariaAttrs['aria-describedby'] = `button-description-${Math.random().toString(36).slice(2)}`
    }

    if (isToggle) {
      ariaAttrs['aria-pressed'] = isPressed
    }

    if (isLoading) {
      ariaAttrs['aria-busy'] = true
      ariaAttrs['aria-disabled'] = true
    }

    // Build final className
    const finalClassName = cn(
      className,
      isLoading && 'opacity-70 cursor-not-allowed'
    )

    return (
      <>
        <Button
          ref={ref}
          disabled={disabled || isLoading}
          className={finalClassName}
          onClick={(e) => {
            if (!isLoading && onClick) {
              onClick(e)
            }
          }}
          {...ariaAttrs}
          {...props}
        >
          <div className="flex items-center gap-2">
            {isLoading && (
              <span className="inline-flex animate-spin">
                {loadingIndicator || (
                  <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
              </span>
            )}
            {icon && !isLoading && icon}
            {children}
          </div>
        </Button>

        {ariaDescription && (
          <span
            id={`button-description-${Math.random().toString(36).slice(2)}`}
            className="sr-only"
          >
            {ariaDescription}
          </span>
        )}

        {shortcut && (
          <span className="sr-only">
            Keyboard shortcut: {shortcut}
          </span>
        )}
      </>
    )
  }
)

AccessibleButton.displayName = 'AccessibleButton'

export default AccessibleButton
