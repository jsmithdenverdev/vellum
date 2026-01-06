/**
 * GraphErrorFallback Molecule
 *
 * Specialized fallback UI for graph rendering errors. Provides helpful
 * guidance and recovery options when the graph visualization fails.
 */

import { memo } from "react";
import Alert from "@cloudscape-design/components/alert";
import Button from "@cloudscape-design/components/button";
import Box from "@cloudscape-design/components/box";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Icon from "@cloudscape-design/components/icon";
import Link from "@cloudscape-design/components/link";

// =============================================================================
// Types
// =============================================================================

export interface GraphErrorFallbackProps {
  /** The error that was caught */
  error?: Error | null;
  /** Callback to reset and retry rendering */
  onReset?: () => void;
  /** Callback to clear the template and start fresh */
  onClearTemplate?: () => void;
}

// =============================================================================
// Styles
// =============================================================================

const containerStyles: React.CSSProperties = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
};

const iconContainerStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "64px",
  height: "64px",
  borderRadius: "50%",
  backgroundColor: "var(--color-background-status-error, #fdf3f3)",
  marginBottom: "16px",
};

// =============================================================================
// Component
// =============================================================================

/**
 * GraphErrorFallback displays a user-friendly error message when the
 * graph visualization fails to render. It provides suggestions for
 * common issues and recovery options.
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={
 *     <GraphErrorFallback
 *       onReset={() => resetGraph()}
 *       onClearTemplate={() => clearTemplate()}
 *     />
 *   }
 * >
 *   <GraphCanvas nodes={nodes} edges={edges} />
 * </ErrorBoundary>
 * ```
 */
function GraphErrorFallbackComponent({
  error,
  onReset,
  onClearTemplate,
}: GraphErrorFallbackProps) {
  return (
    <Container
      header={
        <Header
          variant="h2"
          description="Unable to render the resource graph"
        >
          Resource Graph
        </Header>
      }
      fitHeight
    >
      <div style={containerStyles}>
        <div style={iconContainerStyles}>
          <Icon name="status-negative" size="big" variant="error" />
        </div>

        <SpaceBetween direction="vertical" size="l" alignItems="center">
          <Alert
            type="error"
            header="Graph rendering failed"
          >
            <SpaceBetween direction="vertical" size="s">
              <Box>
                An error occurred while rendering the CloudFormation resource graph.
                This may be due to an issue with the template structure or an
                unexpected error in the visualization engine.
              </Box>

              {error && (
                <Box variant="code" fontSize="body-s">
                  {error.message}
                </Box>
              )}
            </SpaceBetween>
          </Alert>

          <Box variant="h4">Suggestions</Box>

          <SpaceBetween direction="vertical" size="xs">
            <Box>
              <Icon name="check" /> Verify your CloudFormation template is valid JSON or YAML
            </Box>
            <Box>
              <Icon name="check" /> Check that resource types are properly formatted (e.g., AWS::S3::Bucket)
            </Box>
            <Box>
              <Icon name="check" /> Ensure references (Ref, Fn::GetAtt) point to existing resources
            </Box>
            <Box>
              <Icon name="check" /> Try with a simpler template to isolate the issue
            </Box>
          </SpaceBetween>

          <SpaceBetween direction="horizontal" size="s">
            {onReset && (
              <Button variant="primary" onClick={onReset}>
                Try Again
              </Button>
            )}
            {onClearTemplate && (
              <Button variant="normal" onClick={onClearTemplate}>
                Clear Template
              </Button>
            )}
          </SpaceBetween>

          <Box color="text-body-secondary" fontSize="body-s">
            Need help?{" "}
            <Link
              href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-anatomy.html"
              external
            >
              CloudFormation Template Reference
            </Link>
          </Box>
        </SpaceBetween>
      </div>
    </Container>
  );
}

export const GraphErrorFallback = memo(GraphErrorFallbackComponent);
