/**
 * Maalto Design Tokens - Shadows & Elevation
 * 
 * Ambient, tactile shadows without aggressive diffusion or artificial glow.
 */

export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(20, 21, 23, 0.04)',
  sm: '0 1px 3px 0 rgba(20, 21, 23, 0.05), 0 1px 2px -1px rgba(20, 21, 23, 0.03)',
  card: '0 2px 6px -1px rgba(20, 21, 23, 0.05), 0 1px 3px -1px rgba(20, 21, 23, 0.03)',
  cardHover: '0 8px 18px -4px rgba(20, 21, 23, 0.08), 0 2px 6px -1px rgba(20, 21, 23, 0.04)',
  elevated: '0 12px 28px -4px rgba(20, 21, 23, 0.08), 0 4px 10px -2px rgba(20, 21, 23, 0.04)',
  bottomNav: '0 -2px 12px 0 rgba(20, 21, 23, 0.05)',
} as const;
