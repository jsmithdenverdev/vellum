/**
 * ThemeToggle Atom
 *
 * Manual dark/light mode toggle button using Cloudscape Toggle component.
 * Integrates with the application's ThemeContext.
 */

import { memo } from "react";
import Toggle from "@cloudscape-design/components/toggle";
import { useTheme } from "@/hooks/useTheme";

// =============================================================================
// Types
// =============================================================================

export interface ThemeToggleProps {
  /** Optional label override (default: "Dark mode") */
  label?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * ThemeToggle provides a manual dark/light mode toggle switch.
 * Uses the ThemeContext to control the application theme.
 *
 * @example
 * ```tsx
 * <ThemeToggle />
 * <ThemeToggle label="Night mode" />
 * ```
 */
function ThemeToggleComponent({ label = "Dark mode" }: ThemeToggleProps) {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <Toggle
      onChange={toggleDarkMode}
      checked={isDarkMode}
      ariaLabel={label}
    >
      {label}
    </Toggle>
  );
}

export const ThemeToggle = memo(ThemeToggleComponent);
