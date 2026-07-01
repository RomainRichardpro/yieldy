// ─── Glean Design Tokens ──────────────────────────────────────────────────────
// Single source of truth for all visual decisions.
// Never hardcode colors, spacing, or typography in components — import from here.

// ─── Colors ───────────────────────────────────────────────────────────────────

export const colors = {
  // Backgrounds
  page:        '#d9d3c4',  // app background (outside the phone frame on web)
  surface:     '#f6f3ea',  // main screen background
  card:        '#ffffff',  // card / input background
  chip:        '#eef0e3',  // muted chip / secondary button background

  // Content
  ink:         '#25301f',  // primary text
  muted:       '#74795f',  // secondary text, labels, placeholders

  // Brand green
  green:       '#4a7c42',  // primary action, active state, positive value
  greenDeep:   '#2f5a2c',  // pressed state, dark variant
  greenSoft:   '#e7efe0',  // green tint background (chips, highlights)
  greenShadow: 'rgba(74, 124, 66, 0.7)',  // green button shadow

  // Accent orange-red
  accent:      '#c2562f',  // warning, "not yet profitable", destructive
  accentSoft:  '#f3e2d6',  // accent tint background

  // Structural
  line:        '#e8e3d4',  // borders, dividers
  white:       '#ffffff',
  destructive: '#c2403a',  // delete actions
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────
// Based on a 4px base unit.

export const spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  base: 16,
  lg:   18,
  xl:   22,
  xxl:  26,
  xxxl: 32,
} as const;

// ─── Border radius ────────────────────────────────────────────────────────────

export const radius = {
  xs:   8,
  sm:   11,
  md:   13,
  lg:   16,
  xl:   18,
  xxl:  22,
  card: 24,
  pill: 20,
  full: 9999,
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

export const fontSize = {
  xs:   11,
  sm:   12,
  base: 13,
  md:   14,
  lg:   15,
  xl:   16,
  xxl:  18,
  h2:   20,
  h1:   27,
  hero: 46,
} as const;

export const fontWeight = {
  regular:   '400' as const,
  medium:    '500' as const,
  semibold:  '600' as const,
  bold:      '700' as const,
  extrabold: '800' as const,
} as const;

export const lineHeight = {
  tight:  1.1,
  snug:   1.3,
  normal: 1.5,
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  fab: {
    shadowColor: colors.greenShadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 1,
    shadowRadius: 26,
    elevation: 8,
  },
  sheet: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -20 },
    shadowOpacity: 0.3,
    shadowRadius: 50,
    elevation: 24,
  },
} as const;
