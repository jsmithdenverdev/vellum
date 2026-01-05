/**
 * useTheme Hook
 *
 * Hook to access the current theme state from ThemeContext.
 */

import { useContext } from "react";
import {
  ThemeContext,
  type ThemeContextValue,
} from "@/contexts/theme-context";

/**
 * Hook to access the current theme state.
 * Must be used within a ThemeProvider.
 *
 * @returns Theme context value containing isDarkMode boolean
 * @throws Error if used outside of ThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
