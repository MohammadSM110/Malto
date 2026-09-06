/**
 * Maalto Design Tokens - Typography
 * 
 * Tuned specifically for Persian typography (Vazirmatn)
 * with generous line-heights for Persian diacritics and ascenders/descenders.
 */

export const typography = {
  fontFamily: {
    persian: 'var(--font-persian), Vazirmatn, -apple-system, BlinkMacSystemFont, sans-serif',
    latin: 'var(--font-latin), "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  
  // Font scale with calibrated line-heights for Persian
  scale: {
    display: {
      size: '2rem',         // 32px
      lineHeight: '2.5rem', // 40px
      weight: '700',
      letterSpacing: '-0.02em',
    },
    h1: {
      size: '1.5rem',       // 24px
      lineHeight: '2.1rem', // 34px
      weight: '700',
      letterSpacing: '-0.015em',
    },
    h2: {
      size: '1.25rem',      // 20px
      lineHeight: '1.85rem',// 30px
      weight: '600',
      letterSpacing: '-0.01em',
    },
    h3: {
      size: '1.0625rem',    // 17px
      lineHeight: '1.65rem',// 26px
      weight: '600',
    },
    bodyLarge: {
      size: '1rem',         // 16px
      lineHeight: '1.75rem',// 28px
      weight: '400',
    },
    bodyMedium: {
      size: '0.875rem',     // 14px
      lineHeight: '1.55rem',// 25px
      weight: '400',
    },
    bodySmall: {
      size: '0.8125rem',    // 13px
      lineHeight: '1.4rem', // 22px
      weight: '400',
    },
    caption: {
      size: '0.6875rem',    // 11px
      lineHeight: '1.15rem',// 18px
      weight: '500',
    },
  },
} as const;
