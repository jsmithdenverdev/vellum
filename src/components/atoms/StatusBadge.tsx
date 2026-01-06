/**
 * StatusBadge Atom
 *
 * Displays resource status indicators using Cloudscape StatusIndicator.
 * Used for showing resource states like active, pending, or error.
 */

import { memo, useMemo } from "react";
import StatusIndicator, {
  type StatusIndicatorProps,
} from "@cloudscape-design/components/status-indicator";

// =============================================================================
// Types
// =============================================================================

export type StatusType = "active" | "pending" | "error";

export interface StatusBadgeProps {
  /** Status type to display */
  status: StatusType;
  /** Optional custom label (defaults based on status) */
  label?: string;
}

// =============================================================================
// Status Mapping
// =============================================================================

interface StatusConfig {
  type: StatusIndicatorProps["type"];
  defaultLabel: string;
}

const STATUS_MAP: Record<StatusType, StatusConfig> = {
  active: {
    type: "success",
    defaultLabel: "Active",
  },
  pending: {
    type: "pending",
    defaultLabel: "Pending",
  },
  error: {
    type: "error",
    defaultLabel: "Error",
  },
};

// =============================================================================
// Component
// =============================================================================

/**
 * StatusBadge displays a status indicator with appropriate styling.
 * Uses Cloudscape StatusIndicator for consistent visual appearance.
 *
 * @example
 * ```tsx
 * <StatusBadge status="active" />
 * <StatusBadge status="error" label="Failed to deploy" />
 * ```
 */
function StatusBadgeComponent({ status, label }: StatusBadgeProps) {
  const config = useMemo(() => STATUS_MAP[status], [status]);
  const displayLabel = label ?? config.defaultLabel;

  return <StatusIndicator type={config.type}>{displayLabel}</StatusIndicator>;
}

export const StatusBadge = memo(StatusBadgeComponent);
