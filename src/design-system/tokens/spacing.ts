/**
 * Maalto Design Tokens - Spacing & Radius
 * 
 * 4px rhythmic baseline:
 * 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px
 */

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
} as const;

export const radius = {
  none: '0px',
  xs: '4px',
  sm: '8px',
  md: '12px',     // Standard card & input corner
  lg: '16px',     // Modal / container corner
  xl: '22px',     // Special surface
  full: '9999px', // Pills, round action icons, badges
} as const;
