/**
 * Maalto Design Tokens - Colors
 * 
 * Directly extracted from the Figma design and brand swatches:
 * - Electric Cobalt Blue (#2563EB / #2B66F6): Primary brand accent, active category pills, call-to-action buttons
 * - Slate Canvas (#F8FAFC): Clean, high-contrast, modern background
 * - Crisp White Surface (#FFFFFF): For list cards and containers
 * - Deep Charcoal (#0F172A / #111827): High-contrast Persian typography
 * - Soft Slate Borders (#E2E8F0): For clean non-distracting containment
 * - Free-Donation Statuses: Purely community-oriented (no pricing or commercial checkout)
 */

export const colors = {
  // Canvas & Backgrounds
  canvas: {
    base: '#F8FAFC',       // Clean slate canvas from Figma
    muted: '#F1F5F9',      // Secondary background / section wrapper
    subtle: '#E2E8F0',     // Subtle container border
    inverse: '#0F172A',    // Deep slate inverse background
  },

  // Surfaces (Feed Cards, Dialogs, Floating Panels)
  surface: {
    primary: '#FFFFFF',    // Crisp white cards
    secondary: '#F8FAFC',  // Tinted inner surface
    tertiary: '#F1F5F9',   // Thumbnail background
    border: '#E2E8F0',     // Soft tactile border
    borderHover: '#CBD5E1',// Interactive border hover
    borderStrong: '#94A3B8', // High-contrast border
  },

  // Typography
  text: {
    primary: '#0F172A',    // Slate 900 (High-contrast Persian text)
    secondary: '#475569',  // Slate 600 (Item descriptions and metadata)
    tertiary: '#94A3B8',   // Slate 400 (Timestamps, labels, placeholders)
    inverse: '#FFFFFF',    // Text on blue / dark buttons
    brand: '#2563EB',      // Signature Electric Blue
  },

  // Primary Brand: Electric Cobalt Blue (Figma swatch)
  brand: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#2563EB',        // Primary signature tone (Active pill, CTA)
    600: '#1D4ED8',        // Hover / Active
    700: '#1E40AF',
    800: '#1E3A8A',
    900: '#172554',
  },

  // Secondary Architectural Slate
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  // Free-Donation & Condition Badges (From Figma "سالم")
  condition: {
    healthy: {
      text: '#334155',
      bg: '#E2E8F0',
      border: '#CBD5E1',
      label: 'سالم',
    },
    brandNew: {
      text: '#1E40AF',
      bg: '#EFF6FF',
      border: '#BFDBFE',
      label: 'کاملاً نو',
    },
    likeNew: {
      text: '#065F46',
      bg: '#ECFDF5',
      border: '#A7F3D0',
      label: 'در حد نو',
    },
    needsRepair: {
      text: '#9A3412',
      bg: '#FFEDD5',
      border: '#FED7AA',
      label: 'نیازمند تعمیر',
    },
  },

  // Donation Platform Feedback
  feedback: {
    success: {
      text: '#166534',
      bg: '#DCFCE7',
      border: '#BBF7D0',
      dot: '#22C55E',
    },
    warning: {
      text: '#854D0E',
      bg: '#FEF9C3',
      border: '#FEF08A',
      dot: '#EAB308',
    },
    error: {
      text: '#991B1B',
      bg: '#FEE2E2',
      border: '#FECACA',
      dot: '#EF4444',
    },
    info: {
      text: '#1E40AF',
      bg: '#EFF6FF',
      border: '#BFDBFE',
      dot: '#3B82F6',
    },
  },
} as const;
