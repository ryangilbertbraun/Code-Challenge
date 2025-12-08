/**
 * Design System Theme
 *
 * Defines the color palette, typography, and spacing system for the MoodMap app.
 * Uses an 8px grid system for consistent spacing.
 */

export const colors = {
  // Primary colors (calming blues and purples)
  primary: {
    50: "#F0F4FF",
    100: "#E0EAFF",
    200: "#C7D7FE",
    300: "#A5B8FC",
    400: "#818CF8",
    500: "#6366F1", // Main primary
    600: "#4F46E5",
    700: "#4338CA",
    800: "#3730A3",
    900: "#312E81",
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

  // Emotion colors
  emotion: {
    happiness: "#FCD34D", // Warm yellow
    sadness: "#60A5FA", // Soft blue
    anger: "#F87171", // Soft red
    fear: "#A78BFA", // Soft purple
    positive: "#34D399", // Green
    neutral: "#94A3B8", // Gray
    negative: "#FB923C", // Orange
    mixed: "#C084FC", // Purple
  },

  // Semantic colors
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",

  // Background
  background: "#FFFFFF",
  backgroundSecondary: "#F9FAFB",

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
