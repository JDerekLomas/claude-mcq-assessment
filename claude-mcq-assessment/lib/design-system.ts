// Claude.ai Design System
// Based on official Anthropic branding

export const colors = {
  // Primary brand color (Claude orange/terracotta)
  primary: {
    DEFAULT: '#C15F3C',
    hover: '#A8512F',
    light: '#E8B4A0',
  },
  
  // Backgrounds
  bg: {
    primary: '#FFFFFF',
    secondary: '#F9F9F8',
    tertiary: '#F0EFED',
    sidebar: '#F9F9F8',
    hover: '#F0EFED',
    input: '#FFFFFF',
  },
  
  // Text colors
  text: {
    primary: '#1A1A1A',
    secondary: '#666666',
    tertiary: '#999999',
    inverse: '#FFFFFF',
  },
  
  // Borders
  border: {
    light: '#E5E5E3',
    DEFAULT: '#D4D4D1',
    dark: '#B8B8B4',
  },
  
  // Message bubbles
  message: {
    user: '#F9F9F8',
    assistant: '#FFFFFF',
  },
  
  // Learning mode specific
  learning: {
    correct: '#22C55E',
    incorrect: '#EF4444',
    pending: '#C15F3C',
    background: '#FEF7F4',
  },
} as const;

export const typography = {
  // Claude uses a serif for branding, sans-serif for UI
  fontFamily: {
    display: '"Copernicus", ui-serif, Georgia, serif',
    body: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"SF Mono", "Monaco", "Inconsolata", monospace',
  },
  
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
  },
  
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.625',
  },
} as const;

export const spacing = {
  sidebar: '260px',
  maxMessageWidth: '768px',
  inputMaxWidth: '768px',
  borderRadius: {
    sm: '6px',
    md: '12px',
    lg: '16px',
    full: '9999px',
  },
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  input: '0 0 0 1px rgba(0, 0, 0, 0.05)',
} as const;
