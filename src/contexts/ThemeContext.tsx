/**
 * ThemeProvider Component
 *
 * React context provider for managing application theme state.
 * Detects and responds to system color scheme preferences.
 */

import { useState, useEffect, useMemo, useCallback, type ReactNode } from "react";
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
 * Provides isDarkMode boolean and toggleDarkMode function to all child components via context.
 * Supports both automatic system detection and manual override.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  // Track whether user has manually set a preference
  const [manualOverride, setManualOverride] = useState<boolean | null>(null);
  const [systemPreference, setSystemPreference] = useState(
    getSystemDarkModePreference
  );

  // Manual override takes precedence over system preference
  const isDarkMode = manualOverride ?? systemPreference;

  useEffect(() => {
    const mediaQuery = window.matchMedia(DARK_MODE_MEDIA_QUERY);

    // Handler for preference changes
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemPreference(event.matches);
    };

    // Listen for changes
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup listener on unmount
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const toggleDarkMode = useCallback(() => {
    setManualOverride((current) => {
      // If no manual override, toggle from current system preference
      if (current === null) {
        return !systemPreference;
      }
      // Otherwise toggle the manual override
      return !current;
    });
  }, [systemPreference]);

  const value = useMemo(
    () => ({ isDarkMode, toggleDarkMode }),
    [isDarkMode, toggleDarkMode]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
