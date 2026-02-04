/**
 * Accessibility Utilities
 *
 * Helper functions and utilities for implementing WCAG 2.1 AA compliant features:
 * - ARIA attributes and roles
 * - Focus management
 * - Keyboard navigation
 * - Screen reader support
 * - Color contrast checking
 */

/**
 * ARIA Utilities
 */
export const aria = {
  /**
   * Create aria-label for icon-only buttons
   */
  iconLabel: (label: string) => ({
    'aria-label': label,
  }),

  /**
   * Create aria-describedby for form fields with error messages
   */
  errorDescription: (fieldId: string) => ({
    'aria-describedby': `${fieldId}-error`,
  }),

  /**
   * Create attributes for alert messages
   */
  alert: () => ({
    role: 'alert',
    'aria-live': 'assertive',
    'aria-atomic': 'true',
  }),

  /**
   * Create attributes for status messages
   */
  status: () => ({
    role: 'status',
    'aria-live': 'polite',
    'aria-atomic': 'true',
  }),

  /**
   * Create attributes for loading states
   */
  loading: () => ({
    role: 'status',
    'aria-live': 'polite',
    'aria-busy': 'true',
    'aria-label': 'Loading',
  }),

  /**
   * Create attributes for modal dialogs
   */
  dialog: (titleId: string) => ({
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': titleId,
  }),

  /**
   * Create attributes for disclosure/collapsible sections
   */
  disclosure: (isOpen: boolean, contentId: string) => ({
    'aria-expanded': isOpen,
    'aria-controls': contentId,
  }),

  /**
   * Create attributes for tab panels
   */
  tabPanel: (tabId: string, isSelected: boolean) => ({
    role: 'tabpanel',
    'aria-labelledby': tabId,
    hidden: !isSelected,
  }),

  /**
   * Create attributes for tab buttons
   */
  tab: (isSelected: boolean, panelId: string) => ({
    role: 'tab',
    'aria-selected': isSelected,
    'aria-controls': panelId,
    tabIndex: isSelected ? 0 : -1,
  }),

  /**
   * Create attributes for combobox (search/select)
   */
  combobox: (isOpen: boolean, listId: string) => ({
    role: 'combobox',
    'aria-expanded': isOpen,
    'aria-owns': listId,
    'aria-autocomplete': 'list',
  }),

  /**
   * Create attributes for listbox
   */
  listbox: (ariaLabel: string) => ({
    role: 'listbox',
    'aria-label': ariaLabel,
  }),

  /**
   * Create attributes for option in listbox
   */
  option: (isSelected: boolean) => ({
    role: 'option',
    'aria-selected': isSelected,
  }),

  /**
   * Create attributes for disabled elements
   */
  disabled: () => ({
    'aria-disabled': 'true',
    disabled: true,
  }),

  /**
   * Create attributes for toggle buttons
   */
  toggleButton: (isPressed: boolean) => ({
    'aria-pressed': isPressed,
  }),

  /**
   * Create attributes for progress indicators
   */
  progressBar: (value: number, max: number = 100) => ({
    role: 'progressbar',
    'aria-valuenow': value,
    'aria-valuemin': 0,
    'aria-valuemax': max,
    'aria-label': `${Math.round((value / max) * 100)}% complete`,
  }),

  /**
   * Create attributes for skip links
   */
  skipLink: () => ({
    href: '#main-content',
    className: 'sr-only focus:not-sr-only',
  }),

  /**
   * Create attributes for main content region
   */
  main: () => ({
    id: 'main-content',
    role: 'main',
  }),
}

/**
 * Focus Management Utilities
 */
export const focus = {
  /**
   * Get all focusable elements within a container
   */
  getFocusableElements: (container: HTMLElement | null): HTMLElement[] => {
    if (!container) return []

    const focusableSelectors = [
      'button',
      '[href]',
      'input',
      'select',
      'textarea',
      '[tabindex]:not([tabindex="-1"])',
      'audio[controls]',
      'video[controls]',
    ].join(',')

    return Array.from(container.querySelectorAll(focusableSelectors))
  },

  /**
   * Trap focus within a modal/dialog
   */
  trapFocus: (
    containerRef: React.RefObject<HTMLDivElement>,
    onEscape?: () => void
  ) => {
    return (e: KeyboardEvent) => {
      const container = containerRef.current
      if (!container) return

      const focusableElements = focus.getFocusableElements(container)
      const firstElement = focusableElements[0] as HTMLElement | undefined
      const lastElement = focusableElements[focusableElements.length - 1] as
        | HTMLElement
        | undefined

      // Handle Tab key
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift+Tab
          if (document.activeElement === firstElement) {
            lastElement?.focus()
            e.preventDefault()
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            firstElement?.focus()
            e.preventDefault()
          }
        }
      }

      // Handle Escape key
      if (e.key === 'Escape' && onEscape) {
        onEscape()
      }
    }
  },

  /**
   * Restore focus to a previously focused element
   */
  restoreFocus: (previouslyFocused: HTMLElement | null) => {
    if (previouslyFocused && previouslyFocused !== document.body) {
      previouslyFocused.focus()
    }
  },

  /**
   * Focus the first heading of an error summary
   */
  focusErrorSummary: (summaryRef: React.RefObject<HTMLDivElement>) => {
    const summary = summaryRef.current
    if (summary) {
      summary.focus()
      summary.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  },
}

/**
 * Keyboard Navigation Utilities
 */
export const keyboard = {
  /**
   * Handle arrow key navigation in lists
   */
  handleArrowKeys: (
    e: React.KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onChange: (index: number) => void
  ) => {
    let newIndex = currentIndex

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      newIndex = Math.min(currentIndex + 1, items.length - 1)
      e.preventDefault()
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      newIndex = Math.max(currentIndex - 1, 0)
      e.preventDefault()
    } else if (e.key === 'Home') {
      newIndex = 0
      e.preventDefault()
    } else if (e.key === 'End') {
      newIndex = items.length - 1
      e.preventDefault()
    }

    if (newIndex !== currentIndex) {
      onChange(newIndex)
      items[newIndex]?.focus()
    }
  },

  /**
   * Check if Enter key was pressed
   */
  isEnter: (e: React.KeyboardEvent) => e.key === 'Enter',

  /**
   * Check if Space key was pressed
   */
  isSpace: (e: React.KeyboardEvent) => e.key === ' ',

  /**
   * Check if Escape key was pressed
   */
  isEscape: (e: React.KeyboardEvent) => e.key === 'Escape',

  /**
   * Check if Ctrl+Enter was pressed (for form submission)
   */
  isCtrlEnter: (e: React.KeyboardEvent) => e.ctrlKey && e.key === 'Enter',

  /**
   * Get keyboard shortcuts object
   */
  shortcuts: {
    submit: 'Ctrl+Enter',
    cancel: 'Esc',
    save: 'Ctrl+S',
    delete: 'Del',
    selectAll: 'Ctrl+A',
    copy: 'Ctrl+C',
    paste: 'Ctrl+V',
    undo: 'Ctrl+Z',
    redo: 'Ctrl+Shift+Z',
  },
}

/**
 * Screen Reader Support Utilities
 */
export const screenReader = {
  /**
   * Create an announcer component for dynamic updates
   */
  announcer: {
    polite: 'aria-live="polite" aria-atomic="true" role="status"',
    assertive: 'aria-live="assertive" aria-atomic="true" role="alert"',
  },

  /**
   * Create visually hidden but screen-reader visible text
   */
  srOnly: 'sr-only',

  /**
   * Hide element from screen readers
   */
  hide: 'aria-hidden="true"',

  /**
   * Create expanded/collapsed state announcement
   */
  announceExpanded: (isExpanded: boolean) => {
    return isExpanded ? 'expanded' : 'collapsed'
  },

  /**
   * Create loading state announcement
   */
  announceLoading: () => {
    return 'Loading. Please wait.'
  },

  /**
   * Create completion announcement
   */
  announceComplete: (itemCount: number) => {
    return `Loading complete. ${itemCount} item${itemCount !== 1 ? 's' : ''} loaded.`
  },

  /**
   * Create error announcement
   */
  announceError: (errorMessage: string) => {
    return `Error: ${errorMessage}`
  },

  /**
   * Create success announcement
   */
  announceSuccess: (message: string) => {
    return `Success: ${message}`
  },
}

/**
 * Color Contrast Utilities
 */
export const contrast = {
  /**
   * Calculate relative luminance of a color
   */
  getLuminance: (rgb: string): number => {
    const match = rgb.match(/\d+/g)
    if (!match || match.length < 3) return 0

    const [r, g, b] = match.map((x) => parseInt(x) / 255)

    const [rs, gs, bs] = [r, g, b].map((x) => {
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
    })

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  },

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio: (rgb1: string, rgb2: string): number => {
    const l1 = contrast.getLuminance(rgb1)
    const l2 = contrast.getLuminance(rgb2)

    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)

    return (lighter + 0.05) / (darker + 0.05)
  },

  /**
   * Check if contrast meets WCAG AA standard
   */
  meetsWCAG_AA: (rgb1: string, rgb2: string, large: boolean = false): boolean => {
    const ratio = contrast.getContrastRatio(rgb1, rgb2)
    return ratio >= (large ? 3 : 4.5)
  },

  /**
   * Check if contrast meets WCAG AAA standard
   */
  meetsWCAG_AAA: (rgb1: string, rgb2: string, large: boolean = false): boolean => {
    const ratio = contrast.getContrastRatio(rgb1, rgb2)
    return ratio >= (large ? 4.5 : 7)
  },

  /**
   * Get contrast standards
   */
  standards: {
    WCAG_AA_normal: 4.5,
    WCAG_AA_large: 3,
    WCAG_AAA_normal: 7,
    WCAG_AAA_large: 4.5,
    UI_components: 3,
  },
}

/**
 * Motion & Animation Utilities
 */
export const motion = {
  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion: (): boolean => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },

  /**
   * Get animation duration respecting motion preferences
   */
  getDuration: (normalDuration: number, reducedDuration: number = 0): number => {
    return motion.prefersReducedMotion() ? reducedDuration : normalDuration
  },

  /**
   * Get animation class respecting motion preferences
   */
  getAnimationClass: (
    normalClass: string,
    reducedClass?: string
  ): string => {
    return motion.prefersReducedMotion() ? (reducedClass || 'transition-none') : normalClass
  },

  /**
   * Get CSS custom properties for animations
   */
  getCSSProperties: () => ({
    '--animation-duration': motion.prefersReducedMotion() ? '0ms' : '300ms',
    '--animation-timing': 'cubic-bezier(0.4, 0, 0.2, 1)',
  }),
}

/**
 * Touch Target Utilities
 */
export const touchTarget = {
  /**
   * Minimum touch target size in pixels (WCAG 2.5.5)
   */
  minSize: 44,

  /**
   * Minimum padding around touch targets
   */
  minPadding: 8,

  /**
   * Check if element has minimum touch target size
   */
  isAdequateSize: (element: HTMLElement | null): boolean => {
    if (!element) return false

    const rect = element.getBoundingClientRect()
    return rect.width >= touchTarget.minSize && rect.height >= touchTarget.minSize
  },

  /**
   * Get touch target size tailwind class
   */
  sizeClass: 'min-h-[44px] min-w-[44px]',

  /**
   * Get touch target padding tailwind class
   */
  paddingClass: 'p-2',
}

/**
 * Page Structure Utilities
 */
export const pageStructure = {
  /**
   * Validate heading hierarchy (no skipped levels)
   */
  validateHeadingHierarchy: (container: HTMLElement | null): boolean => {
    if (!container) return false

    const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'))
    let previousLevel = 0

    for (const heading of headings) {
      const level = parseInt(heading.tagName[1])
      if (level > previousLevel + 1) {
        console.warn(`Heading hierarchy violation: jumped from H${previousLevel} to H${level}`)
        return false
      }
      previousLevel = level
    }

    return true
  },

  /**
   * Check if page has exactly one H1
   */
  validateSingleH1: (container: HTMLElement | null): boolean => {
    if (!container) return false

    const h1Count = container.querySelectorAll('h1').length
    if (h1Count !== 1) {
      console.warn(`Page should have exactly one H1, found ${h1Count}`)
      return false
    }

    return true
  },

  /**
   * Validate semantic structure
   */
  validateSemanticStructure: (container: HTMLElement | null): boolean => {
    if (!container) return false

    const hasH1 = pageStructure.validateSingleH1(container)
    const hasValidHierarchy = pageStructure.validateHeadingHierarchy(container)
    const hasMain = container.querySelector('main') !== null

    return hasH1 && hasValidHierarchy && hasMain
  },
}

/**
 * Responsive Design Utilities
 */
export const responsive = {
  /**
   * Check if device is mobile
   */
  isMobile: (): boolean => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 640
  },

  /**
   * Check if device prefers dark mode
   */
  prefersDarkMode: (): boolean => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  },

  /**
   * Check if device prefers high contrast
   */
  prefersHighContrast: (): boolean => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-contrast: more)').matches
  },

  /**
   * Get mobile-appropriate text size
   */
  getTextSize: (desktopSize: number): number => {
    return responsive.isMobile() ? Math.max(desktopSize + 2, 16) : desktopSize
  },
}

/**
 * Testing Utilities
 */
export const testing = {
  /**
   * Simulate keyboard event
   */
  simulateKeyboardEvent: (
    key: string,
    options: Partial<KeyboardEventInit> = {}
  ): KeyboardEvent => {
    return new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      ...options,
    })
  },

  /**
   * Check if element is visible to users
   */
  isVisible: (element: HTMLElement | null): boolean => {
    if (!element) return false

    const style = window.getComputedStyle(element)
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0'
    )
  },

  /**
   * Check if element is in viewport
   */
  isInViewport: (element: HTMLElement | null): boolean => {
    if (!element) return false

    const rect = element.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    )
  },

  /**
   * Get all ARIA violations in container
   */
  findAriaViolations: (container: HTMLElement | null): string[] => {
    if (!container) return []

    const violations: string[] = []

    // Check for icon-only buttons without labels
    const iconOnlyButtons = container.querySelectorAll(
      'button:not([aria-label]):not([aria-labelledby])'
    )
    iconOnlyButtons.forEach((btn) => {
      if (btn.textContent?.trim() === '') {
        violations.push('Icon-only button missing aria-label')
      }
    })

    // Check for form fields without labels
    const inputs = container.querySelectorAll('input, select, textarea')
    inputs.forEach((input) => {
      const label = container.querySelector(`label[for="${input.id}"]`)
      const hasAriaLabel = input.hasAttribute('aria-label')
      const hasAriaLabelledby = input.hasAttribute('aria-labelledby')

      if (!label && !hasAriaLabel && !hasAriaLabelledby) {
        violations.push(`Form field ${input.id} missing label`)
      }
    })

    return violations
  },
}

export default {
  aria,
  focus,
  keyboard,
  screenReader,
  contrast,
  motion,
  touchTarget,
  pageStructure,
  responsive,
  testing,
}
