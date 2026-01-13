/**
 * useResourceGrouping Hook
 *
 * React hook for managing resource grouping state and controls.
 * Handles grouping nodes by AWS service type.
 */

import { useState, useMemo, useCallback } from 'react'
import type { CfnNode } from '@/types/graph'
import {
  groupNodesByService,
  type ResourceGroup,
  type GroupingConfig,
} from '@/lib/resource-grouping'

// =============================================================================
// Types
// =============================================================================

export interface ResourceGroupingState {
  /** Whether grouping is currently enabled */
  isGroupingEnabled: boolean
  /** All resource groups */
  groups: ResourceGroup[]
  /** Toggle grouping on/off */
  toggleGrouping: () => void
  /** Enable grouping */
  enableGrouping: () => void
  /** Disable grouping */
  disableGrouping: () => void
  /** Set minimum group size */
  setMinGroupSize: (size: number) => void
  /** Current minimum group size */
  minGroupSize: number
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook for managing resource grouping state.
 *
 * @param nodes - All nodes in the graph
 * @param initialEnabled - Whether grouping starts enabled (default: false)
 * @param initialMinSize - Initial minimum group size (default: 2)
 * @returns Grouping state and control functions
 *
 * @example
 * ```typescript
 * const { isGroupingEnabled, groups, toggleGrouping } =
 *   useResourceGrouping(nodes);
 *
 * // Toggle grouping
 * <Button onClick={toggleGrouping}>
 *   {isGroupingEnabled ? 'Ungroup' : 'Group by Service'}
 * </Button>
 *
 * // Display groups
 * {groups.map(group => (
 *   <div key={group.service}>{group.label}</div>
 * ))}
 * ```
 */
export function useResourceGrouping(
  nodes: CfnNode[],
  initialEnabled = false,
  initialMinSize = 2
): ResourceGroupingState {
  const [isGroupingEnabled, setIsGroupingEnabled] = useState(initialEnabled)
  const [minGroupSize, setMinGroupSize] = useState(initialMinSize)

  // Calculate groups based on current state
  const groups = useMemo(() => {
    const config: GroupingConfig = {
      enabled: isGroupingEnabled,
      minGroupSize,
    }
    return groupNodesByService(nodes, config)
  }, [nodes, isGroupingEnabled, minGroupSize])

  // Toggle grouping
  const toggleGrouping = useCallback(() => {
    setIsGroupingEnabled((prev) => !prev)
  }, [])

  // Enable grouping
  const enableGrouping = useCallback(() => {
    setIsGroupingEnabled(true)
  }, [])

  // Disable grouping
  const disableGrouping = useCallback(() => {
    setIsGroupingEnabled(false)
  }, [])

  return {
    isGroupingEnabled,
    groups,
    toggleGrouping,
    enableGrouping,
    disableGrouping,
    setMinGroupSize,
    minGroupSize,
  }
}
