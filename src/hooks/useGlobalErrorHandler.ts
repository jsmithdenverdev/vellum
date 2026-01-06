/**
 * useGlobalErrorHandler Hook
 *
 * Listens for unhandled errors and promise rejections at the window level.
 * Provides centralized error logging and optional notification handling.
 */

import { useEffect, useCallback, useRef } from "react";

// =============================================================================
// Types
// =============================================================================

export interface GlobalErrorEvent {
  /** Type of error event */
  type: "error" | "unhandledrejection";
  /** Error message */
  message: string;
  /** Original error object, if available */
  error?: Error;
  /** Stack trace, if available */
  stack?: string;
  /** Source file where error occurred (for window errors) */
  filename?: string;
  /** Line number where error occurred (for window errors) */
  lineno?: number;
  /** Column number where error occurred (for window errors) */
  colno?: number;
  /** Timestamp when error occurred */
  timestamp: number;
}

export interface UseGlobalErrorHandlerOptions {
  /**
   * Callback invoked when a global error is caught.
   * Can be used to display notifications, log to external services, etc.
   */
  onError?: (event: GlobalErrorEvent) => void;
  /**
   * Whether to log errors to the console.
   * @default true in development, false in production
   */
  logToConsole?: boolean;
  /**
   * Whether to prevent the default error handling behavior.
   * @default false
   */
  preventDefault?: boolean;
}

// =============================================================================
// Constants
// =============================================================================

const isDevelopment = process.env.NODE_ENV === "development";

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook to handle global unhandled errors and promise rejections.
 *
 * Attaches event listeners to the window object to catch:
 * - Unhandled JavaScript errors (window.onerror)
 * - Unhandled promise rejections (window.onunhandledrejection)
 *
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * function App() {
 *   useGlobalErrorHandler({
 *     onError: (event) => {
 *       // Send to error tracking service
 *       trackError(event);
 *
 *       // Show notification to user
 *       showToast(`An error occurred: ${event.message}`);
 *     },
 *   });
 *
 *   return <MyApp />;
 * }
 * ```
 */
export function useGlobalErrorHandler(
  options: UseGlobalErrorHandlerOptions = {}
): void {
  const {
    onError,
    logToConsole = isDevelopment,
    preventDefault = false,
  } = options;

  // Use refs to avoid recreating handlers when options change
  const onErrorRef = useRef(onError);
  const logToConsoleRef = useRef(logToConsole);
  const preventDefaultRef = useRef(preventDefault);

  // Update refs when options change
  useEffect(() => {
    onErrorRef.current = onError;
    logToConsoleRef.current = logToConsole;
    preventDefaultRef.current = preventDefault;
  }, [onError, logToConsole, preventDefault]);

  // Handle window error events
  const handleWindowError = useCallback(
    (event: ErrorEvent): boolean | void => {
      const errorEvent: GlobalErrorEvent = {
        type: "error",
        message: event.message || "Unknown error",
        error: event.error instanceof Error ? event.error : undefined,
        stack: event.error instanceof Error ? event.error.stack : undefined,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: Date.now(),
      };

      // Log to console if enabled
      if (logToConsoleRef.current) {
        console.error("[GlobalErrorHandler] Uncaught error:", errorEvent);
      }

      // Call custom error handler
      onErrorRef.current?.(errorEvent);

      // Prevent default behavior if requested
      if (preventDefaultRef.current) {
        event.preventDefault();
        return true;
      }
    },
    []
  );

  // Handle unhandled promise rejections
  const handleUnhandledRejection = useCallback(
    (event: PromiseRejectionEvent): void => {
      const reason = event.reason;
      const isError = reason instanceof Error;

      const errorEvent: GlobalErrorEvent = {
        type: "unhandledrejection",
        message: isError
          ? reason.message
          : typeof reason === "string"
            ? reason
            : "Unhandled promise rejection",
        error: isError ? reason : undefined,
        stack: isError ? reason.stack : undefined,
        timestamp: Date.now(),
      };

      // Log to console if enabled
      if (logToConsoleRef.current) {
        console.error(
          "[GlobalErrorHandler] Unhandled promise rejection:",
          errorEvent
        );
      }

      // Call custom error handler
      onErrorRef.current?.(errorEvent);

      // Prevent default behavior if requested
      if (preventDefaultRef.current) {
        event.preventDefault();
      }
    },
    []
  );

  // Attach event listeners on mount, cleanup on unmount
  useEffect(() => {
    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [handleWindowError, handleUnhandledRejection]);
}
