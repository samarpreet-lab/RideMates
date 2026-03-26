// =============================================================================
// constants/responsive.ts — Responsive Scaling Utilities
// =============================================================================
// Provides scaling functions to make the UI adapt to different screen sizes.
// Based on a base design of 375x812 (iPhone X/11/12/13 standard).
// =============================================================================

import { Dimensions, PixelRatio, Platform } from 'react-native';

// Base dimensions (iPhone X design baseline)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// Get current screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Calculate scale factors
const widthScale = SCREEN_WIDTH / BASE_WIDTH;
const heightScale = SCREEN_HEIGHT / BASE_HEIGHT;

// Use the smaller scale to maintain aspect ratio
const scale = Math.min(widthScale, heightScale);

/**
 * Scale a size value based on screen width.
 * Use for horizontal dimensions (width, marginHorizontal, paddingLeft, etc.)
 */
export function wp(size: number): number {
  const scaledSize = (size / BASE_WIDTH) * SCREEN_WIDTH;
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
}

/**
 * Scale a size value based on screen height.
 * Use for vertical dimensions (height, marginVertical, paddingTop, etc.)
 */
export function hp(size: number): number {
  const scaledSize = (size / BASE_HEIGHT) * SCREEN_HEIGHT;
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
}

/**
 * Scale a size value uniformly (maintains aspect ratio).
 * Use for fonts, icons, border radius, and elements that should scale proportionally.
 */
export function sp(size: number): number {
  const scaledSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
}

/**
 * Moderate scale - less aggressive scaling for fonts.
 * Prevents fonts from becoming too large on tablets or too small on compact phones.
 * @param size - Base size
 * @param factor - Scaling factor (0 = no scale, 1 = full scale). Default: 0.5
 */
export function ms(size: number, factor: number = 0.5): number {
  const scaledSize = size + (sp(size) - size) * factor;
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
}

/**
 * Get font size with platform-specific adjustments.
 * Android typically needs slightly larger fonts for readability.
 */
export function fs(size: number): number {
  const scaled = ms(size, 0.3);
  // Slight boost for Android readability
  return Platform.OS === 'android' ? scaled + 0.5 : scaled;
}

// Screen dimension constants
export const SCREEN = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmall: SCREEN_WIDTH < 360,       // Small phones (e.g., iPhone SE, old Androids)
  isMedium: SCREEN_WIDTH >= 360 && SCREEN_WIDTH < 414,  // Standard phones
  isLarge: SCREEN_WIDTH >= 414,      // Large phones / phablets
  isTablet: SCREEN_WIDTH >= 600,     // Tablets
};

// Breakpoint-based values
export function responsive<T>(options: { small: T; medium: T; large: T; tablet?: T }): T {
  if (SCREEN.isTablet && options.tablet !== undefined) return options.tablet;
  if (SCREEN.isLarge) return options.large;
  if (SCREEN.isMedium) return options.medium;
  return options.small;
}

// Common spacing values (pre-scaled)
export const SPACING = {
  xs: sp(4),
  sm: sp(8),
  md: sp(12),
  lg: sp(16),
  xl: sp(20),
  xxl: sp(24),
  xxxl: sp(32),
};

// Common font sizes (pre-scaled)
export const FONT_SIZE = {
  xs: fs(10),
  sm: fs(12),
  md: fs(14),
  lg: fs(16),
  xl: fs(18),
  xxl: fs(20),
  title: fs(24),
  header: fs(28),
};

// Common border radius (pre-scaled)
export const RADIUS = {
  sm: sp(4),
  md: sp(8),
  lg: sp(12),
  xl: sp(16),
  xxl: sp(24),
  full: sp(999),
};

// Icon sizes (pre-scaled)
export const ICON_SIZE = {
  xs: sp(12),
  sm: sp(16),
  md: sp(20),
  lg: sp(24),
  xl: sp(28),
  xxl: sp(32),
};

export default {
  wp,
  hp,
  sp,
  ms,
  fs,
  SCREEN,
  SPACING,
  FONT_SIZE,
  RADIUS,
  ICON_SIZE,
  responsive,
};
