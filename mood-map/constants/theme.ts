/**
 * Design System Theme
 *
 * Defines the color palette, typography, and spacing system for the MoodMap app.
 * Uses an 8px grid system for consistent spacing.
 */

export const colors = {
  // Primary colors (soft dusty rose/mauve - yoga app inspired)
  primary: {
    50: "#FAF5F6",
    100: "#F5EBED",
    200: "#EBD7DA",
    300: "#E1C3C7",
    400: "#DCBFC1", // Main primary - soft dusty rose
    500: "#D7AFB4",
    600: "#C99BA1",
    700: "#B8868E",
    800: "#A6727B",
    900: "#8F5E68",
  },

  // Neutral colors
  neutral: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#E5E5E5",
    300: "#D4D4D4",
    400: "#A3A3A3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
  },

  // Emotion colors (soft, muted tones)
  emotion: {
    happiness: "#F9E4A6", // Soft warm yellow
    sadness: "#A8C5E0", // Soft blue
    anger: "#E8B4B4", // Soft coral
    fear: "#C9B8E0", // Soft lavender
    positive: "#B8DCC8", // Soft sage green
    neutral: "#D4D4D4", // Soft gray
    negative: "#F5C4A0", // Soft peach
    mixed: "#D9C4E0", // Soft mauve
  },

  // Semantic colors (soft, calming versions)
  success: "#A8D5BA",
  error: "#E8B4B4",
  warning: "#F5D5A0",
  info: "#A8C5E0",

  // Background (warm, soft whites)
  background: "#FFFCFC",
  backgroundSecondary: "#FAF5F6",

  // Text
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
} as const;

export const typography = {
  fontFamily: {
    regular: "System",
    medium: "System",
    semibold: "System",
    bold: "System",
  },

  fontSize: {
    xs: 12,
    sm: 14,
    base: 16, // Base font size
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },

  fontWeight: {
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
} as const;

/**
 * Spacing system based on 8px grid
 * All spacing values are multiples of 8px for consistency
 */
export const spacing = {
  0: 0,
  1: 4,
  2: 8, // Base unit (8px grid)
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

// Type exports for TypeScript autocomplete
export type ColorKey = keyof typeof colors;
export type PrimaryColorShade = keyof typeof colors.primary;
export type NeutralColorShade = keyof typeof colors.neutral;
export type EmotionColor = keyof typeof colors.emotion;
export type FontSize = keyof typeof typography.fontSize;
export type Spacing = keyof typeof spacing;

// Legacy Colors export for compatibility with existing Expo template code
export const Colors = {
  light: {
    text: colors.textPrimary,
    background: colors.background,
    tint: colors.primary[400], // Soft dusty rose
    icon: colors.neutral[600],
    tabIconDefault: colors.neutral[500],
    tabIconSelected: colors.primary[400],
  },
  dark: {
    text: colors.neutral[50],
    background: colors.neutral[900],
    tint: colors.primary[300],
    icon: colors.neutral[400],
    tabIconDefault: colors.neutral[500],
    tabIconSelected: colors.primary[300],
  },
};
