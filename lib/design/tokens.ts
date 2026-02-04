// Design tokens for Ecclesia GNC
// Centralized design system following Google/Meta standards
// SYNCED WITH: app/globals.css (navy primary + gold accent theme)

// Helper function to convert OKLch to hex for reference
// Navy Primary: oklch(0.16 0.08 254.2) ≈ #001a4d
// Gold Accent: oklch(0.85 0.21 106.8) ≈ #ffc900

export const colors = {
  // Primary - Navy Blue (actions, links, active states)
  // Light mode: oklch(0.16 0.08 254.2) - Dark navy
  // Dark mode: oklch(0.92 0.12 104.5) - Gold
  primary: {
    50: '#f0f4ff',
    100: '#e0e9ff',
    200: '#c1d3ff',
    300: '#a2bcff',
    400: '#6b9cff',
    500: '#3b7bff',
    600: '#0052cc', // Close to navy #001a4d
    700: '#003da6',
    800: '#002966',
    900: '#001a4d', // Navy primary
  },

  // Accent - Gold/Yellow (emphasis, highlights)
  // Light mode: oklch(0.85 0.21 106.8) ≈ #ffc900
  // Dark mode: oklch(0.88 0.22 107.5) ≈ #ffd700
  accent: {
    50: '#fffef0',
    100: '#fffcde',
    200: '#fff9bd',
    300: '#fff89c',
    400: '#ffd700',
    500: '#ffc900', // Gold accent
    600: '#e6b800',
    700: '#ccaa00',
    800: '#997700',
    900: '#665500',
  },

  // Secondary - Lighter Gold shade
  secondary: {
    50: '#fffef0',
    100: '#fffbde',
    200: '#fff9bd',
    300: '#fff89c',
    400: '#ffeb99',
    500: '#ffe680',
    600: '#ffd966',
    700: '#ffcc33',
    800: '#e6b800',
    900: '#cc9900',
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
  },

  // Error/Destructive - Red
  error: {
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
  },

  // Neutral - Slate (backgrounds, borders, text)
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Additional semantic colors
  info: '#0ea5e9',
  pending: '#f59e0b',
  active: '#22c55e',
  inactive: '#6b7280',
  visitor: '#0ea5e9',
  newConvert: '#f59e0b',

  // Background & Foreground (light mode)
  background: '#ffffff',
  foreground: '#111827',
  card: '#ffffff',
  cardForeground: '#111827',
  muted: '#f3f4f6',
  mutedForeground: '#6b7280',
  border: '#e5e7eb',
  input: '#e5e7eb',
  ring: '#ffc900',

  // Dark mode overrides
  darkBackground: '#0f172a',
  darkForeground: '#f8fafc',
  darkCard: '#1e293b',
  darkCardForeground: '#f8fafc',
  darkMuted: '#334155',
  darkMutedForeground: '#cbd5e1',
  darkBorder: '#1e293b',
  darkInput: '#1e293b',
  darkRing: '#ffd700',
}

export const typography = {
  // Font families
  fontFamily: {
    sans: [
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif',
    ].join(', '),
    mono: [
      'Menlo',
      'Monaco',
      'Courier New',
      'monospace',
    ].join(', '),
    geist: 'var(--font-geist-sans)',
  },

  // Font sizes
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '42px',
  },

  // Font weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  // Letter spacing
  letterSpacing: {
    tight: '-0.02em',
    normal: '0em',
    wide: '0.02em',
    wider: '0.05em',
  },

  // Heading styles
  heading: {
    h1: {
      fontSize: '32px',
      fontWeight: 800,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '24px',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '20px',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '18px',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body: {
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: 1.4,
    },
  },
}

export const spacing = {
  // Base spacing scale (4px = 1 unit)
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '96px',

  // Aliases for Tailwind compatibility
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
}

export const borderRadius = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  full: '9999px',
}

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
}

export const transitions = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  slower: '500ms',

  timing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
}

export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

export const zIndex = {
  hide: '-1',
  auto: 'auto',
  base: '0',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modal: '1040',
  popover: '1050',
  tooltip: '1060',
}

export const animations = {
  fadeIn: {
    duration: '200ms',
    timing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    keyframes: {
      from: { opacity: '0' },
      to: { opacity: '1' },
    },
  },
  fadeOut: {
    duration: '150ms',
    timing: 'cubic-bezier(0.4, 0, 0.6, 1)',
    keyframes: {
      from: { opacity: '1' },
      to: { opacity: '0' },
    },
  },
  slideInUp: {
    duration: '300ms',
    timing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    keyframes: {
      from: { opacity: '0', transform: 'translateY(10px)' },
      to: { opacity: '1', transform: 'translateY(0)' },
    },
  },
  slideInDown: {
    duration: '300ms',
    timing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    keyframes: {
      from: { opacity: '0', transform: 'translateY(-10px)' },
      to: { opacity: '1', transform: 'translateY(0)' },
    },
  },
  slideOutUp: {
    duration: '200ms',
    timing: 'cubic-bezier(0.4, 0, 0.6, 1)',
    keyframes: {
      from: { opacity: '1', transform: 'translateY(0)' },
      to: { opacity: '0', transform: 'translateY(-10px)' },
    },
  },
  pulse: {
    duration: '2s',
    timing: 'cubic-bezier(0.4, 0, 0.6, 1)',
    keyframes: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' },
    },
  },
  spin: {
    duration: '1s',
    timing: 'linear',
    keyframes: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },
  },
}

export const componentStyles = {
  button: {
    primary: {
      background: colors.primary[700],
      color: '#ffffff',
      padding: '10px 16px',
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      border: 'none',
      cursor: 'pointer',
      transition: `background-color ${transitions.base} ${transitions.timing.ease}`,
      '&:hover': {
        background: colors.primary[800],
      },
      '&:active': {
        background: colors.primary[900],
      },
      '&:disabled': {
        background: colors.neutral[300],
        cursor: 'not-allowed',
        opacity: '0.5',
      },
      '&:focus': {
        outline: 'none',
        boxShadow: `0 0 0 3px ${colors.accent[50]}`,
      },
    },
    secondary: {
      background: colors.neutral[100],
      color: colors.neutral[900],
      padding: '10px 16px',
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      border: `1px solid ${colors.neutral[300]}`,
      cursor: 'pointer',
      transition: `all ${transitions.base} ${transitions.timing.ease}`,
      '&:hover': {
        background: colors.neutral[200],
      },
      '&:focus': {
        outline: 'none',
        boxShadow: `0 0 0 3px ${colors.accent[50]}`,
      },
    },
    accent: {
      background: colors.accent[500],
      color: colors.primary[900],
      padding: '10px 16px',
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      border: 'none',
      cursor: 'pointer',
      transition: `background-color ${transitions.base} ${transitions.timing.ease}`,
      '&:hover': {
        background: colors.accent[600],
      },
      '&:focus': {
        outline: 'none',
        boxShadow: `0 0 0 3px ${colors.accent[100]}`,
      },
    },
    danger: {
      background: colors.error[600],
      color: '#ffffff',
      padding: '10px 16px',
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      border: 'none',
      cursor: 'pointer',
      transition: `background-color ${transitions.base} ${transitions.timing.ease}`,
      '&:hover': {
        background: colors.error[700],
      },
      '&:focus': {
        outline: 'none',
        boxShadow: `0 0 0 3px ${colors.error[100]}`,
      },
    },
  },
  card: {
    background: '#ffffff',
    borderRadius: borderRadius.lg,
    border: `1px solid ${colors.neutral[200]}`,
    padding: spacing.md,
    boxShadow: shadows.sm,
    transition: `all ${transitions.base} ${transitions.timing.ease}`,
    '&:hover': {
      boxShadow: shadows.md,
      borderColor: colors.neutral
      [300],
    },
  },
  input: {
    padding: '10px 12px',
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.neutral[300]}`,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.sans,
    transition: `all ${transitions.base} ${transitions.timing.ease}`,
    '&:focus': {
      outline: 'none',
      borderColor: colors.primary[600],
      boxShadow: `0 0 0 3px ${colors.primary[50]}`,
    },
    '&:disabled': {
      background: colors.neutral[100],
      cursor: 'not-allowed',
    },
  },
}

export const mediaQueries = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,

  motion: '@media (prefers-reduced-motion: no-preference)',
  darkMode: '@media (prefers-color-scheme: dark)',
  lightMode: '@media (prefers-color-scheme: light)',
  touchDevice: '@media (hover: none) and (pointer: coarse)',
}

export const accessibility = {
  focusOutline: {
    outline: `2px solid ${colors.primary[600]}`,
    outlineOffset: '2px',
  },
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: '0',
  },
  focusVisible: {
    outline: `2px solid ${colors.accent[500]}`,
    outlineOffset: '2px',
  },
}

// Touch-friendly sizing
export const touchTargets = {
  small: '32px',
  base: '44px',
  large: '56px',
}

// Semantic status colors
export const statusColors = {
  active: colors.success[600],
  inactive: colors.neutral[500],
  pending: colors.warning[600],
  warning: colors.warning[600],
  error: colors.error[600],
  success: colors.success[600],
  info: colors.primary[600],
  visitor: colors.info,
  convert: colors.accent[500],
}

// Church brand colors (navy + gold)
export const brandColors = {
  navy: colors.primary[900],
  gold: colors.accent[500],
  darkNavy: colors.primary[900],
  lightGold: colors.accent[100],
}

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  breakpoints,
  zIndex,
  animations,
  componentStyles,
  mediaQueries,
  accessibility,
  touchTargets,
  statusColors,
  brandColors,
}
