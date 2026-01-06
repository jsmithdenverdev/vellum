/**
 * ResourceLabel Atom
 *
 * Displays truncating text with a tooltip on hover.
 * Used for resource names and other labels that may overflow.
 */

import { memo, useMemo } from "react";
import Popover from "@cloudscape-design/components/popover";
import Box from "@cloudscape-design/components/box";

// =============================================================================
// Types
// =============================================================================

export interface ResourceLabelProps {
  /** Text content to display */
  text: string;
  /** Maximum width in pixels before truncation (default: 150) */
  maxWidth?: number;
  /** Font weight (default: "normal") */
  fontWeight?: "normal" | "bold";
  /** Font size in pixels (default: 13) */
  fontSize?: number;
  /** Text color (optional, uses inherit by default) */
  color?: string;
}

// =============================================================================
// Style Generators
// =============================================================================

function createLabelStyles(
  maxWidth: number,
  fontWeight: "normal" | "bold",
  fontSize: number,
  color?: string
): React.CSSProperties {
  return {
    maxWidth: `${maxWidth}px`,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    fontWeight: fontWeight === "bold" ? 600 : 400,
    fontSize: `${fontSize}px`,
    lineHeight: 1.3,
    display: "block",
    ...(color ? { color } : {}),
  };
}

// =============================================================================
// Component
// =============================================================================

/**
 * ResourceLabel displays text with truncation and a popover tooltip on hover.
 * The tooltip only appears when the text is truncated.
 *
 * @example
 * ```tsx
 * <ResourceLabel text="MyLongResourceName" maxWidth={100} fontWeight="bold" />
 * ```
 */
function ResourceLabelComponent({
  text,
  maxWidth = 150,
  fontWeight = "normal",
  fontSize = 13,
  color,
}: ResourceLabelProps) {
  const labelStyles = useMemo(
    () => createLabelStyles(maxWidth, fontWeight, fontSize, color),
    [maxWidth, fontWeight, fontSize, color]
  );

  // Determine if text will likely overflow (rough estimate)
  // Average character width is approximately 0.6 * fontSize for proportional fonts
  const averageCharWidth = fontSize * 0.6;
  const estimatedTextWidth = text.length * averageCharWidth;
  const willOverflow = estimatedTextWidth > maxWidth;

  // If text won't overflow, just render without popover
  if (!willOverflow) {
    return <span style={labelStyles}>{text}</span>;
  }

  return (
    <Popover
      dismissButton={false}
      position="top"
      size="small"
      triggerType="text"
      content={<Box fontSize="body-s">{text}</Box>}
    >
      <span style={labelStyles}>{text}</span>
    </Popover>
  );
}

export const ResourceLabel = memo(ResourceLabelComponent);
