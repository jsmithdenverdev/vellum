/**
 * useUrlState Hook
 *
 * Encapsulates URL state management for CloudFormation templates.
 * Handles initial load from URL and auto-updates URL when template changes.
 */

import { useState, useCallback, useSyncExternalStore } from "react";

import {
  getTemplateFromUrl,
  setTemplateInUrl,
  clearTemplateFromUrl,
} from "@/lib/url-state";

/**
 * Return type for the useUrlState hook
 */
export interface UseUrlStateReturn {
  /** Current template value */
  template: string;
  /** Update template and optionally sync to URL */
  setTemplate: (value: string, updateUrl?: boolean) => void;
  /** Clear template from both state and URL */
  clearTemplate: () => void;
  /** Whether the initial URL load has completed */
  isInitialized: boolean;
}

// Initial template from URL (computed once on module load)
const initialUrlTemplate = getTemplateFromUrl();

/**
 * Hook to manage URL state for CloudFormation templates.
 *
 * Handles:
 * - Initial load from URL query parameters
 * - Syncing template changes to URL
 * - Clearing template from URL
 *
 * @returns Template state and control functions
 *
 * @example
 * ```tsx
 * function App() {
 *   const { template, setTemplate, clearTemplate, isInitialized } = useUrlState();
 *
 *   // Template is automatically loaded from URL on mount
 *   // Changes are synced to URL by default
 *   const handleChange = (value: string) => {
 *     setTemplate(value); // Updates URL
 *     setTemplate(value, false); // Does not update URL
 *   };
 * }
 * ```
 */
export function useUrlState(): UseUrlStateReturn {
  // Initialize template state from URL (lazy initialization avoids effect)
  const [template, setTemplateState] = useState(() => initialUrlTemplate ?? "");

  // Track initialization with useSyncExternalStore for SSR compatibility
  // Using a simple boolean since we only initialize once
  const isInitialized = useSyncExternalStore(
    // Subscribe - no-op since this never changes
    () => () => {},
    // getSnapshot - always true on client
    () => true,
    // getServerSnapshot - false on server
    () => false
  );

  // Set template with optional URL update
  const setTemplate = useCallback((value: string, updateUrl = true) => {
    setTemplateState(value);

    if (updateUrl && value.trim()) {
      setTemplateInUrl(value);
    }
  }, []);

  // Clear template from both state and URL
  const clearTemplate = useCallback(() => {
    setTemplateState("");
    clearTemplateFromUrl();
  }, []);

  return {
    template,
    setTemplate,
    clearTemplate,
    isInitialized,
  };
}
