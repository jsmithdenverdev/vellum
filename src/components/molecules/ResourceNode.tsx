/**
 * ResourceNode Component
 *
 * Custom React Flow node for displaying CloudFormation resources.
 * Styled to match AWS Infrastructure Composer design language.
 * Uses ServiceIcon atom for consistent icon rendering.
 */

import { memo, useMemo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { CfnNodeData } from "@/types/graph";
import { extractResourceName } from "@/lib/aws-icons";
import { useTheme } from "@/hooks/useTheme";
import { ServiceIcon } from "@/components/atoms";

// =============================================================================
// Design Tokens
// =============================================================================

/**
 * AWS Infrastructure Composer design tokens
 */
const DESIGN_TOKENS = {
  // Dimensions
  nodeWidth: 220,
  iconSize: 40,
  borderRadius: 8,
  labelMaxWidth: 140,

  // Light mode colors
  light: {
    background: "#ffffff",
    border: "#d1d5db",
    borderSelected: "#0972d3",
    textPrimary: "#16191f",
    textSecondary: "#5f6b7a",
    handleBackground: "#687078",
    handleBorder: "#ffffff",
    shadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    shadowSelected:
      "0 0 0 2px rgba(9, 114, 211, 0.3), 0 2px 4px rgba(0, 0, 0, 0.15)",
  },

  // Dark mode colors (AWS Console dark theme)
  dark: {
    background: "#232f3e",
    border: "#3f4b5b",
    borderSelected: "#539fe5",
    textPrimary: "#ffffff",
    textSecondary: "#8d99a8",
    handleBackground: "#8d99a8",
    handleBorder: "#232f3e",
    shadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
    shadowSelected:
      "0 0 0 2px rgba(83, 159, 229, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)",
  },

  // Typography
  fontFamily: '"Amazon Ember", "Helvetica Neue", Roboto, Arial, sans-serif',
  fontSizePrimary: 13,
  fontSizeSecondary: 11,
} as const;

// =============================================================================
// Style Generators
// =============================================================================

interface ThemeColors {
  background: string;
  border: string;
  borderSelected: string;
  textPrimary: string;
  textSecondary: string;
  handleBackground: string;
  handleBorder: string;
  shadow: string;
  shadowSelected: string;
}

function getThemeColors(isDarkMode: boolean): ThemeColors {
  return isDarkMode ? DESIGN_TOKENS.dark : DESIGN_TOKENS.light;
}

/**
 * Highlight colors for search matches
 */
const HIGHLIGHT_COLORS = {
  light: {
    border: "#0972d3",
    shadow: "0 0 0 2px rgba(9, 114, 211, 0.4), 0 2px 6px rgba(9, 114, 211, 0.25)",
  },
  dark: {
    border: "#539fe5",
    shadow: "0 0 0 2px rgba(83, 159, 229, 0.5), 0 2px 6px rgba(83, 159, 229, 0.3)",
  },
} as const;

interface NodeStyleOptions {
  selected: boolean;
  isDimmed: boolean;
  isHighlighted: boolean;
  isDarkMode: boolean;
}

function createNodeStyles(
  colors: ThemeColors,
  options: NodeStyleOptions
): React.CSSProperties {
  const { selected, isDimmed, isHighlighted, isDarkMode } = options;
  const highlightColors = isDarkMode ? HIGHLIGHT_COLORS.dark : HIGHLIGHT_COLORS.light;

  // Determine border color based on state
  let borderColor = colors.border;
  if (selected) {
    borderColor = colors.borderSelected;
  } else if (isHighlighted) {
    borderColor = highlightColors.border;
  }

  // Determine shadow based on state
  let boxShadow = colors.shadow;
  if (selected) {
    boxShadow = colors.shadowSelected;
  } else if (isHighlighted) {
    boxShadow = highlightColors.shadow;
  }

  return {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 14px",
    backgroundColor: colors.background,
    border: `1px solid ${borderColor}`,
    borderRadius: `${DESIGN_TOKENS.borderRadius}px`,
    boxShadow,
    width: `${DESIGN_TOKENS.nodeWidth}px`,
    fontSize: `${DESIGN_TOKENS.fontSizePrimary}px`,
    fontFamily: DESIGN_TOKENS.fontFamily,
    transition: "box-shadow 0.2s ease, border-color 0.2s ease, opacity 0.2s ease",
    cursor: "grab",
    opacity: isDimmed ? 0.35 : 1,
  };
}

function createContentStyles(): React.CSSProperties {
  return {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    overflow: "hidden",
    minWidth: 0,
    flex: 1,
  };
}

function createTypeLabelStyles(colors: ThemeColors): React.CSSProperties {
  return {
    fontSize: `${DESIGN_TOKENS.fontSizeSecondary}px`,
    color: colors.textSecondary,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    lineHeight: 1.2,
    fontWeight: 400,
    textTransform: "capitalize",
    maxWidth: `${DESIGN_TOKENS.labelMaxWidth}px`,
  };
}

function createResourceNameStyles(colors: ThemeColors): React.CSSProperties {
  return {
    fontWeight: 600,
    color: colors.textPrimary,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    lineHeight: 1.3,
    fontSize: `${DESIGN_TOKENS.fontSizePrimary}px`,
    maxWidth: `${DESIGN_TOKENS.labelMaxWidth}px`,
  };
}

function createHandleStyles(
  colors: ThemeColors,
  position: "left" | "right"
): React.CSSProperties {
  return {
    width: "10px",
    height: "10px",
    backgroundColor: colors.handleBackground,
    border: `2px solid ${colors.handleBorder}`,
    borderRadius: "50%",
    ...(position === "left" ? { left: "-5px" } : { right: "-5px" }),
  };
}

// =============================================================================
// Component
// =============================================================================

// Define the node type for this component
type CfnResourceNode = Node<CfnNodeData, "cfnResource">;

/**
 * Custom React Flow node component for CloudFormation resources.
 * Styled to match AWS Infrastructure Composer design.
 *
 * Structure (matches AWS Infrastructure Composer):
 * ```
 * +----------------------------------+
 * |                        +------+  |
 * |  Lambda Function       | icon |  |
 * |  MyFunction            |      |  |
 * |                        +------+  |
 * +----------------------------------+
 * ```
 */
function ResourceNodeComponent({
  data,
  selected,
}: NodeProps<CfnResourceNode>) {
  const { isDarkMode } = useTheme();

  // Extract search/filter state from node data
  const isDimmed = data.isDimmed ?? false;
  const isHighlighted = data.isHighlighted ?? false;

  // Memoize computed values
  const resourceName = useMemo(
    () => extractResourceName(data.resourceType),
    [data.resourceType]
  );

  const colors = useMemo(() => getThemeColors(isDarkMode), [isDarkMode]);

  // Memoize styles to prevent unnecessary object creation
  const nodeStyles = useMemo(
    () =>
      createNodeStyles(colors, {
        selected: selected ?? false,
        isDimmed,
        isHighlighted,
        isDarkMode,
      }),
    [colors, selected, isDimmed, isHighlighted, isDarkMode]
  );

  const contentStyles = useMemo(() => createContentStyles(), []);

  const typeLabelStyles = useMemo(
    () => createTypeLabelStyles(colors),
    [colors]
  );

  const resourceNameStyles = useMemo(
    () => createResourceNameStyles(colors),
    [colors]
  );

  const leftHandleStyles = useMemo(
    () => createHandleStyles(colors, "left"),
    [colors]
  );

  const rightHandleStyles = useMemo(
    () => createHandleStyles(colors, "right"),
    [colors]
  );

  return (
    <div style={{ position: "relative" }}>
      {/* Input handle (left side - receives dependencies) */}
      <Handle
        type="target"
        position={Position.Left}
        style={leftHandleStyles}
        id="target"
      />

      {/* Node content */}
      <div style={nodeStyles}>
        {/* Resource info (left side) */}
        <div style={contentStyles}>
          <div style={typeLabelStyles} title={data.resourceType}>
            {resourceName}
          </div>
          <div style={resourceNameStyles} title={data.logicalId}>
            {data.logicalId}
          </div>
        </div>

        {/* Service icon (right side) - using ServiceIcon atom */}
        <ServiceIcon
          serviceType={data.resourceType}
          size={DESIGN_TOKENS.iconSize}
        />
      </div>

      {/* Output handle (right side - provides dependencies) */}
      <Handle
        type="source"
        position={Position.Right}
        style={rightHandleStyles}
        id="source"
      />
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const ResourceNode = memo(ResourceNodeComponent);
