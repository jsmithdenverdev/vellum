/**
 * ServiceIcon Atom
 *
 * Displays an AWS service icon with fallback to an abbreviation.
 * Uses the aws-icons library for service identification.
 */

import { useMemo, memo } from "react";
import { getServiceInfo, getIconUrl } from "@/lib/aws-icons";

// =============================================================================
// Types
// =============================================================================

export interface ServiceIconProps {
  /** CloudFormation resource type (e.g., "AWS::Lambda::Function") */
  serviceType: string;
  /** Icon size in pixels (default: 40) */
  size?: number;
}

// =============================================================================
// Style Generators
// =============================================================================

function createContainerStyles(
  size: number,
  hasIcon: boolean
): React.CSSProperties {
  return {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "6px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    // Fallback styling for when no icon is available
    ...(hasIcon
      ? {}
      : {
          backgroundColor: "#687078",
          color: "#ffffff",
          fontSize: `${Math.max(10, size * 0.3)}px`,
          fontWeight: 700,
          letterSpacing: "0.3px",
        }),
  };
}

function createImageStyles(size: number): React.CSSProperties {
  return {
    width: `${size}px`,
    height: `${size}px`,
    objectFit: "cover",
  };
}

// =============================================================================
// Component
// =============================================================================

/**
 * ServiceIcon displays an AWS service icon based on CloudFormation resource type.
 * Falls back to a styled abbreviation when no icon is available.
 *
 * @example
 * ```tsx
 * <ServiceIcon serviceType="AWS::Lambda::Function" size={40} />
 * ```
 */
function ServiceIconComponent({ serviceType, size = 40 }: ServiceIconProps) {
  const serviceInfo = useMemo(
    () => getServiceInfo(serviceType),
    [serviceType]
  );

  const iconUrl = useMemo(() => getIconUrl(serviceType), [serviceType]);

  const containerStyles = useMemo(
    () => createContainerStyles(size, !!iconUrl),
    [size, iconUrl]
  );

  const imageStyles = useMemo(() => createImageStyles(size), [size]);

  return (
    <div style={containerStyles} aria-label={serviceInfo.name}>
      {iconUrl ? (
        <img src={iconUrl} alt={serviceInfo.name} style={imageStyles} />
      ) : (
        serviceInfo.abbreviation
      )}
    </div>
  );
}

export const ServiceIcon = memo(ServiceIconComponent);
