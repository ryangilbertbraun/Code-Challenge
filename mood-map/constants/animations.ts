/**
 * Animation Constants
 *
 * Defines animation durations, easing functions, and feedback values
 * for consistent motion design throughout the app.
 */

/**
 * Animation durations in milliseconds
 */
export const animations = {
  duration: {
    fast: 150,
    normal: 200,
    slow: 300,
  },

  /**
   * Easing functions for smooth animations
   * Using cubic-bezier curves for natural motion
   */
  easing: {
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  },

  /**
   * Visual feedback values for interactive elements
   */
  feedback: {
    pressOpacity: 0.7,
    pressScale: 0.97,
    hoverOpacity: 0.8,
  },
} as const;

// Type exports for TypeScript autocomplete
export type AnimationDuration = keyof typeof animations.duration;
export type AnimationEasing = keyof typeof animations.easing;
