/**
 * useGraphAnalytics Hook
 *
 * React hook for graph analytics and dependency path highlighting.
 * Manages selected node state and calculates dependency paths.
 */

import { useState, useMemo, useCallback } from 'react'
import type { CfnNode, CfnEdge } from '@/types/graph'
import {
  findDependencyPaths,
  calculateGraphMetrics,
  type DependencyPaths,
  type GraphMetrics,
} from '@/lib/graph-analytics'

// =============================================================================
// Types
// =============================================================================

export interface GraphAnalyticsState {
  /** Currently selected node ID for path highlighting */
  selectedNodeId: string | null
  /** Dependency paths for the selected node */
  dependencyPaths: DependencyPaths | null
  /** Graph metrics and statistics */
  metrics: GraphMetrics
  /** Select a node to highlight its dependency paths */
  selectNode: (nodeId: string | null) => void
  /** Clear the current selection */
  clearSelection: () => void
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook for managing graph analytics and dependency path highlighting.
 *
 * @param nodes - All nodes in the graph
 * @param edges - All edges in the graph
 * @returns Analytics state and control functions
 *
 * @example
 * ```typescript
 * const { selectedNodeId, dependencyPaths, metrics, selectNode } =
 *   useGraphAnalytics(nodes, edges);
 *
 * // Select a node to highlight paths
 * selectNode('MyFunction');
 *
 * // Check if a node is in the path
 * const isHighlighted = dependencyPaths?.upstream.has(nodeId) ||
 *                       dependencyPaths?.downstream.has(nodeId);
 * ```
 */
export function useGraphAnalytics(nodes: CfnNode[], edges: CfnEdge[]): GraphAnalyticsState {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  // Calculate graph metrics (memoized)
  const metrics = useMemo(() => calculateGraphMetrics(nodes, edges), [nodes, edges])

  // Calculate dependency paths for selected node (memoized)
  const dependencyPaths = useMemo(() => {
    if (!selectedNodeId) return null
    return findDependencyPaths(selectedNodeId, edges)
  }, [selectedNodeId, edges])

  // Select a node
  const selectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId)
  }, [])

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedNodeId(null)
  }, [])

  return {
    selectedNodeId,
    dependencyPaths,
    metrics,
    selectNode,
    clearSelection,
  }
}
