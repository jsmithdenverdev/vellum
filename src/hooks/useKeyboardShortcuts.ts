/**
 * useKeyboardShortcuts Hook
 *
 * Provides keyboard shortcut handling for the application.
 * Supports platform-aware modifier keys (Cmd on Mac, Ctrl on Windows/Linux).
 */

import { useEffect, useCallback, useRef } from "react";

// =============================================================================
// Types
// =============================================================================

export interface KeyboardShortcutHandlers {
  /** Cmd/Ctrl+Enter - Trigger visualization */
  onVisualize?: () => void;
  /** Escape - Close panels */
  onEscape?: () => void;
  /** Cmd/Ctrl+K - Future search functionality */
  onSearch?: () => void;
}

export interface UseKeyboardShortcutsOptions {
  /** Whether shortcuts are enabled (default: true) */
  enabled?: boolean;
}

// =============================================================================
// Utilities
// =============================================================================

/**
 * Detects if the current platform is macOS
 */
function isMac(): boolean {
  if (typeof navigator === "undefined") return false;
  return navigator.platform.toLowerCase().includes("mac");
}

/**
 * Checks if the modifier key is pressed (Cmd on Mac, Ctrl on Windows/Linux)
 */
function isModifierPressed(event: KeyboardEvent): boolean {
  return isMac() ? event.metaKey : event.ctrlKey;
}

/**
 * Checks if the event target is an input element where shortcuts should be ignored
 */
function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();
  const isContentEditable = target.isContentEditable;

  // Allow shortcuts in code editor but with special handling
  // The code editor uses a textarea, so we need to be careful
  return (
    (tagName === "input" || tagName === "textarea" || isContentEditable) &&
    !target.closest(".ace_editor") // Allow in ACE editor for Cmd+Enter
  );
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook for managing keyboard shortcuts across the application.
 *
 * Shortcuts:
 * - Cmd/Ctrl+Enter: Trigger visualization
 * - Escape: Close panels (details panel, navigation)
 * - Cmd/Ctrl+K: Open search (future functionality)
 *
 * @param handlers - Callback functions for each shortcut
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts({
 *   onVisualize: () => visualizeTemplate(),
 *   onEscape: () => closePanel(),
 *   onSearch: () => openSearch(),
 * });
 * ```
 */
export function useKeyboardShortcuts(
  handlers: KeyboardShortcutHandlers,
  options: UseKeyboardShortcutsOptions = {}
): void {
  const { enabled = true } = options;

  // Use refs to avoid stale closures - update in effect to satisfy lint rule
  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  });

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const { key } = event;
      const modifierPressed = isModifierPressed(event);
      const target = event.target;

      // Cmd/Ctrl+Enter - Visualize
      // Allow this even in text inputs (for the code editor)
      if (modifierPressed && key === "Enter") {
        event.preventDefault();
        handlersRef.current.onVisualize?.();
        return;
      }

      // Don't process other shortcuts when in input elements
      if (isInputElement(target)) return;

      // Escape - Close panels
      if (key === "Escape") {
        // Don't prevent default for Escape - let it propagate for native behavior
        handlersRef.current.onEscape?.();
        return;
      }

      // Cmd/Ctrl+K - Search (future)
      if (modifierPressed && key === "k") {
        event.preventDefault();
        handlersRef.current.onSearch?.();
        return;
      }
    },
    [enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}

/**
 * Returns the platform-specific modifier key label
 * Useful for displaying shortcut hints in the UI
 */
export function getModifierKeyLabel(): string {
  return isMac() ? "Cmd" : "Ctrl";
}

/**
 * Formats a shortcut for display
 * @param key - The key (e.g., "Enter", "K")
 * @param includeModifier - Whether to include the modifier key
 */
export function formatShortcut(key: string, includeModifier = true): string {
  if (!includeModifier) return key;

  const modifier = isMac() ? "\u2318" : "Ctrl+";
  return `${modifier}${key}`;
}
