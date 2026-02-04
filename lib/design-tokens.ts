/**
 * Design Tokens & Theme Configuration
 * Central source of truth for colors, spacing, typography, and animations
 * Following design system best practices from Google Material Design & Meta Design
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const colors = {
  // Primary - Blue (main brand color)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // Success - Green
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#145231',
    950: '#0c2f1b',
  },

  // Warning - Amber
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  // Destructive - Red
  destructive: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  // Neutral - Slate
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  // Semantic colors
  info: '#0ea5e9',
  link: '#2563eb',
  linkHover: '#1d4ed8',
  border: '#e2e8f0',
  borderDark: '#334155',
  background: '#ffffff',
  backgroundDark: '#0f172a',
  surface: '#f8fafc',
  surfaceDark: '#1e293b',
  text: '#0f172a',
  textDark: '#ffffff',
  textSecondary: '#64748b',
  textSecondaryDark: '#cbd5e1',
} as const;

// ============================================================================
// SPACING SYSTEM (4px base)
// ============================================================================

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  base: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '40px',
  '3xl': '48px',
  '4xl': '56px',
  '5xl': '64px',
} as const;

// ============================================================================
// TYPOGRAPHY SCALE
// ============================================================================

export const typography = {
  // Display - Page hero content
  display: {
    xl: {
      fontSize: '48px',
      lineHeight: '56px',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    lg: {
      fontSize: '36px',
      lineHeight: '44px',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
  },

  // Heading - Section titles
  heading: {
    xl: {
      fontSize: '32px',
      lineHeight: '40px',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    lg: {
      fontSize: '28px',
      lineHeight: '36px',
      fontWeight: 700,
      letterSpacing: '0em',
    },
    md: {
      fontSize: '24px',
      lineHeight: '32px',
      fontWeight: 700,
      letterSpacing: '0em',
    },
    sm: {
      fontSize: '20px',
      lineHeight: '28px',
      fontWeight: 600,
      letterSpacing: '0em',
    },
  },

  // Body - Main content text
  body: {
    lg: {
      fontSize: '18px',
      lineHeight: '28px',
      fontWeight: 400,
      letterSpacing: '0em',
    },
    base: {
      fontSize: '16px',
      lineHeight: '24px',
      fontWeight: 400,
      letterSpacing: '0em',
    },
    sm: {
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: 400,
      letterSpacing: '0em',
    },
    xs: {
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: 400,
      letterSpacing: '0em',
    },
  },

  // Label - Form labels, captions
  label: {
    lg: {
      fontSize: '16px',
      lineHeight: '24px',
      fontWeight: 500,
      letterSpacing: '0em',
    },
    base: {
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: 500,
      letterSpacing: '0em',
    },
    sm: {
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: 500,
      letterSpacing: '0em',
    },
  },

  // Code - Monospace font
  code: {
    base: {
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: 400,
      letterSpacing: '0.02em',
      fontFamily: '"Fira Code", "Courier New", monospace',
    },
  },
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: '0px',
  sm: '4px',
  base: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  hover: '0 8px 12px 0 rgba(0, 0, 0, 0.08)',
  focus: '0 0 0 3px rgba(37, 99, 235, 0.1), 0 0 0 1px rgba(37, 99, 235, 0.5)',
  error: '0 0 0 3px rgba(220, 38, 38, 0.1), 0 0 0 1px rgba(220, 38, 38, 0.5)',
} as const;

// ============================================================================
// TRANSITIONS & ANIMATIONS
// ============================================================================

export const transitions = {
  fast: '150ms ease-out',
  base: '200ms ease-out',
  slow: '300ms ease-out',
  slowest: '500ms ease-out',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export const animations = {
  // Button hover effect
  buttonHover: {
    transform: 'scale(1.02)',
    transition: `all ${transitions.fast}`,
  },

  // Button active effect
  buttonActive: {
    transform: 'scale(0.98)',
    transition: `all ${transitions.fast}`,
  },

  // Fade in animation
  fadeIn: {
    animation: 'fadeIn 300ms ease-out',
  },

  // Slide in animation
  slideInUp: {
    animation: 'slideInUp 300ms ease-out',
  },

  // Pulse animation
  pulse: {
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },

  // Spin animation (loading)
  spin: {
    animation: 'spin 1s linear infinite',
  },

  // Skeleton loading animation
  shimmer: {
    animation: 'shimmer 2s infinite',
  },
} as const;

// ============================================================================
// COMPONENT SIZES
// ============================================================================

export const sizes = {
  // Button sizes
  button: {
    xs: {
      padding: '6px 12px',
      fontSize: '12px',
      height: '28px',
    },
    sm: {
      padding: '8px 14px',
      fontSize: '13px',
      height: '32px',
    },
    base: {
      padding: '10px 16px',
      fontSize: '14px',
      height: '36px',
    },
    lg: {
      padding: '12px 20px',
      fontSize: '16px',
      height: '40px',
    },
    xl: {
      padding: '14px 24px',
      fontSize: '16px',
      height: '44px',
    },
  },

  // Input sizes
  input: {
    sm: {
      padding: '6px 12px',
      fontSize: '12px',
      height: '28px',
    },
    base: {
      padding: '10px 12px',
      fontSize: '14px',
      height: '36px',
    },
    lg: {
      padding: '12px 14px',
      fontSize: '16px',
      height: '40px',
    },
  },

  // Icon sizes
  icon: {
    xs: '16px',
    sm: '20px',
    base: '24px',
    lg: '32px',
    xl: '40px',
    '2xl': '48px',
  },

  // Avatar sizes
  avatar: {
    xs: '24px',
    sm: '32px',
    base: '40px',
    lg: '48px',
    xl: '56px',
    '2xl': '64px',
  },
} as const;

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  notification: 80,
  skipLink: 90,
} as const;

// ============================================================================
// BREAKPOINTS (Mobile-first)
// ============================================================================

export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================================================
// MOTION PREFERENCES
// ============================================================================

export const motion = {
  prefersReduced: '@media (prefers-reduced-motion: reduce)',
  prefersColorSchemeDark: '@media (prefers-color-scheme: dark)',
  prefersColorSchemeLight: '@media (prefers-color-scheme: light)',
} as const;

// ============================================================================
// SEMANTIC TOKENS (Context-aware colors)
// ============================================================================

export const semanticTokens = {
  light: {
    primary: colors.primary[600],
    secondary: colors.neutral[600],
    background: colors.neutral[50],
    surface: colors.neutral[50],
    text: colors.neutral[900],
    textSecondary: colors.neutral[600],
    border: colors.neutral[200],
    success: colors.success[600],
    warning: colors.warning[600],
    error: colors.destructive[600],
    info: colors.primary[600],
  },
  dark: {
    primary: colors.primary[400],
    secondary: colors.neutral[400],
    background: colors.neutral[900],
    surface: colors.neutral[950],
    text: colors.neutral[50],
    textSecondary: colors.neutral[400],
    border: colors.neutral[700],
    success: colors.success[400],
    warning: colors.warning[400],
    error: colors.destructive[400],
    info: colors.primary[400],
  },
} as const;

// ============================================================================
// FOCUS RING STYLES
// ============================================================================

export const focusRing = {
  light: `0 0 0 3px ${colors.primary[50]}, 0 0 0 5px ${colors.primary[600]}`,
  dark: `0 0 0 3px ${colors.neutral[800]}, 0 0 0 5px ${colors.primary[400]}`,
  error: `0 0 0 3px ${colors.destructive[50]}, 0 0 0 5px ${colors.destructive[600]}`,
} as const;

// ============================================================================
// THEME CONFIGURATION
// ============================================================================

export const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  transitions,
  animations,
  sizes,
  zIndex,
  breakpoints,
  motion,
  semanticTokens,
  focusRing,
} as const;

export type Theme = typeof theme;
export type ThemeColors = typeof colors;
export type ThemeSpacing = typeof spacing;
export type ThemeTypography = typeof typography;
