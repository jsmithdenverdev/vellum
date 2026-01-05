/**
 * ResourceNode Component
 *
 * Custom React Flow node for displaying CloudFormation resources.
 * Styled to match AWS Infrastructure Composer design language.
 */

import { memo, useMemo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { CfnNodeData } from "@/types/graph";
import {
  getServiceInfo,
  extractResourceName,
  type ServiceInfo,
} from "@/lib/aws-icons";
import { useTheme } from "@/hooks/useTheme";

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
  iconBorderRadius: 6,

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
    shadowSelected: "0 0 0 2px rgba(9, 114, 211, 0.3), 0 2px 4px rgba(0, 0, 0, 0.15)",
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
    shadowSelected: "0 0 0 2px rgba(83, 159, 229, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)",
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

function createNodeStyles(
  colors: ThemeColors,
  selected: boolean
): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 14px",
    backgroundColor: colors.background,
    border: `1px solid ${selected ? colors.borderSelected : colors.border}`,
    borderRadius: `${DESIGN_TOKENS.borderRadius}px`,
    boxShadow: selected ? colors.shadowSelected : colors.shadow,
    width: `${DESIGN_TOKENS.nodeWidth}px`,
    fontSize: `${DESIGN_TOKENS.fontSizePrimary}px`,
    fontFamily: DESIGN_TOKENS.fontFamily,
    transition: "box-shadow 0.2s ease, border-color 0.2s ease",
    cursor: "grab",
  };
}

function createIconContainerStyles(
  serviceInfo: ServiceInfo
): React.CSSProperties {
  return {
    width: `${DESIGN_TOKENS.iconSize}px`,
    height: `${DESIGN_TOKENS.iconSize}px`,
    borderRadius: `${DESIGN_TOKENS.iconBorderRadius}px`,
    backgroundColor: serviceInfo.color,
    border: `1px solid ${serviceInfo.borderColor}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.3px",
    textShadow: "0 1px 1px rgba(0, 0, 0, 0.2)",
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

function createLabelStyles(colors: ThemeColors): React.CSSProperties {
  return {
    fontWeight: 600,
    color: colors.textPrimary,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    lineHeight: 1.3,
    fontSize: `${DESIGN_TOKENS.fontSizePrimary}px`,
  };
}

function createTypeStyles(colors: ThemeColors): React.CSSProperties {
  return {
    fontSize: `${DESIGN_TOKENS.fontSizeSecondary}px`,
    color: colors.textSecondary,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    lineHeight: 1.2,
    fontWeight: 400,
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
 * Structure:
 * ```
 * +----------------------------------+
 * | +------+                         |
 * | | icon |  MyFunction             |
 * | |      |  AWS::Lambda::Function  |
 * | +------+                         |
 * +----------------------------------+
 * ```
 */
function ResourceNodeComponent({
  data,
  selected,
}: NodeProps<CfnResourceNode>) {
  const { isDarkMode } = useTheme();

  // Memoize computed values
  const serviceInfo = useMemo(
    () => getServiceInfo(data.resourceType),
    [data.resourceType]
  );

  const resourceName = useMemo(
    () => extractResourceName(data.resourceType),
    [data.resourceType]
  );

  const colors = useMemo(() => getThemeColors(isDarkMode), [isDarkMode]);

  // Memoize styles to prevent unnecessary object creation
  const nodeStyles = useMemo(
    () => createNodeStyles(colors, selected ?? false),
    [colors, selected]
  );

  const iconContainerStyles = useMemo(
    () => createIconContainerStyles(serviceInfo),
    [serviceInfo]
  );

  const contentStyles = useMemo(() => createContentStyles(), []);

  const labelStyles = useMemo(() => createLabelStyles(colors), [colors]);

  const typeStyles = useMemo(() => createTypeStyles(colors), [colors]);

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
        {/* Service icon with colored background */}
        <div style={iconContainerStyles} aria-label={serviceInfo.name}>
          {serviceInfo.abbreviation}
        </div>

        {/* Resource info */}
        <div style={contentStyles}>
          <div style={labelStyles} title={data.logicalId}>
            {data.logicalId}
          </div>
          <div style={typeStyles} title={data.resourceType}>
            {resourceName}
          </div>
        </div>
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
