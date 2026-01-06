/**
 * Theme Context Definition
 *
 * Separate file for the context to satisfy react-refresh linting rules.
 */

import { createContext } from "react";

// =============================================================================
// Types
// =============================================================================

export interface ThemeContextValue {
  /** Whether dark mode is currently active */
  isDarkMode: boolean;
  /** Toggle dark mode on/off */
  toggleDarkMode: () => void;
}

// =============================================================================
// Context
// =============================================================================

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined
);
