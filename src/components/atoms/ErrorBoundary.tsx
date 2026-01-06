/**
 * ErrorBoundary Atom
 *
 * React error boundary component that catches rendering errors in child
 * components and displays a fallback UI. Uses Cloudscape components for
 * consistent styling.
 */

import { Component, type ReactNode, type ErrorInfo } from "react";
import Alert from "@cloudscape-design/components/alert";
import Button from "@cloudscape-design/components/button";
import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";

// =============================================================================
// Types
// =============================================================================

export interface ErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;
  /** Optional custom fallback UI to display on error */
  fallback?: ReactNode;
  /** Optional callback when reset is triggered */
  onReset?: () => void;
  /** Optional callback when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// =============================================================================
// Component
// =============================================================================

/**
 * ErrorBoundary catches JavaScript errors anywhere in the child component
 * tree and displays a fallback UI instead of crashing the whole application.
 *
 * Note: Error boundaries must be class components as there is no hook
 * equivalent for componentDidCatch.
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={<CustomErrorUI />}
 *   onReset={() => clearState()}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Store error info for display
    this.setState({ errorInfo });

    // Call optional error callback
    this.props.onError?.(error, errorInfo);

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error);
      console.error("Component stack:", errorInfo.componentStack);
    }
  }

  handleReset = (): void => {
    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call optional reset callback
    this.props.onReset?.();
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default fallback UI
      return (
        <Box padding="l">
          <Alert
            type="error"
            header="Something went wrong"
            action={
              <Button onClick={this.handleReset}>Try Again</Button>
            }
          >
            <SpaceBetween direction="vertical" size="xs">
              <Box>
                An unexpected error occurred while rendering this component.
              </Box>
              {error && (
                <Box variant="code" fontSize="body-s" color="text-status-error">
                  {error.message}
                </Box>
              )}
            </SpaceBetween>
          </Alert>
        </Box>
      );
    }

    return children;
  }
}
