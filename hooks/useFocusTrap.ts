'use client'

import { useEffect, useRef } from 'react'
import { focus } from '@/lib/accessibility'

interface UseFocusTrapOptions {
  /**
   * Whether the focus trap is active
   */
  isActive?: boolean

  /**
   * Callback when Escape key is pressed
   */
  onEscape?: () => void

  /**
   * Initial focus element ref or selector
   */
  initialFocusRef?: React.RefObject<HTMLElement>

  /**
   * Whether to restore focus when trap is deactivated
   */
  restoreFocus?: boolean
}

/**
 * useFocusTrap Hook
 *
 * Implements focus trapping for modals and dialogs.
 * - Traps Tab/Shift+Tab within the container
 * - Handles Escape key to close
 * - Restores focus when closed
 * - WCAG 2.1 AA compliant
 *
 * @example
 * export function Modal({ isOpen, onClose, children }) {
 *   const ref = useFocusTrap({ isActive: isOpen, onEscape: onClose })
 *
 *   return (
 *     <div ref={ref} role="dialog">
 *       {children}
 *     </div>
 *   )
 * }
 */
export function useFocusTrap(options: UseFocusTrapOptions = {}) {
  const {
    isActive = true,
    onEscape,
    initialFocusRef,
    restoreFocus = true,
  } = options

  const containerRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) {
      return
    }

    // Store the previously focused element
    previouslyFocusedRef.current = document.activeElement as HTMLElement

    // Get all focusable elements
    const focusableElements = focus.getFocusableElements(containerRef.current)

    if (focusableElements.length === 0) {
      return
    }

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    // Focus the initial element or first focusable element
    const elementToFocus = initialFocusRef?.current || firstElement
    elementToFocus?.focus()

    // Handle keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Tab key
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift+Tab - move to previous element
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          // Tab - move to next element
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }

      // Handle Escape key
      if (e.key === 'Escape' && onEscape) {
        onEscape()
        e.preventDefault()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown)

      // Restore focus if requested
      if (restoreFocus && previouslyFocusedRef.current) {
        focus.restoreFocus(previouslyFocusedRef.current)
      }
    }
  }, [isActive, onEscape, initialFocusRef, restoreFocus])

  return containerRef
}

export default useFocusTrap
