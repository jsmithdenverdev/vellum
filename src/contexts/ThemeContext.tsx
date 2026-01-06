/**
 * ThemeProvider Component
 *
 * React context provider for managing application theme state.
 * Detects and responds to system color scheme preferences.
 */

import { useState, useEffect, useMemo, type ReactNode } from "react";
import { ThemeContext } from "./theme-context";

// =============================================================================
// Types
// =============================================================================

interface ThemeProviderProps {
  /** Child components that will have access to theme context */
  children: ReactNode;
}

// =============================================================================
// Media Query
// =============================================================================

const DARK_MODE_MEDIA_QUERY = "(prefers-color-scheme: dark)";

/**
 * Gets the current system dark mode preference
 */
function getSystemDarkModePreference(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia(DARK_MODE_MEDIA_QUERY).matches;
}

// =============================================================================
// Provider
// =============================================================================

/**
 * ThemeProvider component that detects and tracks system color scheme preference.
 * Provides isDarkMode boolean to all child components via context.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState(getSystemDarkModePreference);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DARK_MODE_MEDIA_QUERY);

    // Handler for preference changes
    const handleChange = (event: MediaQueryListEvent) => {
      setIsDarkMode(event.matches);
    };

    // Listen for changes
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup listener on unmount
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const value = useMemo(() => ({ isDarkMode }), [isDarkMode]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
