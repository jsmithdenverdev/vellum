/**
 * Graph Analytics
 *
 * Pure functions for analyzing CloudFormation resource graphs.
 * Provides dependency path detection, cycle detection, and graph metrics.
 */

import type { CfnNode, CfnEdge } from '@/types/graph'

// =============================================================================
// Types
// =============================================================================

/**
 * Result of dependency path analysis for a node
 */
export interface DependencyPaths {
  /** IDs of nodes that this node depends on (upstream) */
  upstream: Set<string>
  /** IDs of nodes that depend on this node (downstream) */
  downstream: Set<string>
  /** IDs of edges in the dependency paths */
  edgeIds: Set<string>
}

/**
 * Graph metrics and statistics
 */
export interface GraphMetrics {
  /** Total number of resources */
  totalResources: number
  /** Total number of dependencies */
  totalDependencies: number
  /** Maximum depth of dependency chain */
  maxDepth: number
  /** Resources grouped by AWS service type */
  resourcesByService: Map<string, number>
  /** Resources with no dependencies (leaf nodes) */
  leafNodes: number
  /** Resources with no dependents (root nodes) */
  rootNodes: number
  /** Whether the graph contains cycles */
  hasCycles: boolean
}

// =============================================================================
// Dependency Path Detection
// =============================================================================

/**
 * Builds an adjacency list representation of the graph for efficient traversal.
 * Returns both forward (dependencies) and reverse (dependents) maps.
 */
function buildAdjacencyMaps(edges: CfnEdge[]): {
  dependencies: Map<string, Set<string>>
  dependents: Map<string, Set<string>>
} {
  const dependencies = new Map<string, Set<string>>()
  const dependents = new Map<string, Set<string>>()

  for (const edge of edges) {
    // Edge direction: source -> target (dependency -> consumer)
    // So target depends on source
    if (!dependencies.has(edge.target)) {
      dependencies.set(edge.target, new Set())
    }
    dependencies.get(edge.target)!.add(edge.source)

    if (!dependents.has(edge.source)) {
      dependents.set(edge.source, new Set())
    }
    dependents.get(edge.source)!.add(edge.target)
  }

  return { dependencies, dependents }
}

/**
 * Performs depth-first search to find all reachable nodes from a starting node.
 * Uses iterative approach to avoid stack overflow on deep graphs.
 */
function findReachableNodes(
  startNodeId: string,
  adjacencyMap: Map<string, Set<string>>
): Set<string> {
  const reachable = new Set<string>()
  const stack = [startNodeId]
  const visited = new Set<string>()

  while (stack.length > 0) {
    const current = stack.pop()!

    if (visited.has(current)) {
      continue
    }

    visited.add(current)

    const neighbors = adjacencyMap.get(current)
    if (neighbors) {
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          reachable.add(neighbor)
          stack.push(neighbor)
        }
      }
    }
  }

  return reachable
}

/**
 * Finds all edges that connect nodes in the given set.
 */
function findEdgesInPath(nodeIds: Set<string>, edges: CfnEdge[]): Set<string> {
  const edgeIds = new Set<string>()

  for (const edge of edges) {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      edgeIds.add(edge.id)
    }
  }

  return edgeIds
}

/**
 * Analyzes dependency paths for a given node.
 * Returns all upstream dependencies, downstream dependents, and connecting edges.
 *
 * @param nodeId - The node to analyze
 * @param edges - All edges in the graph
 * @returns Dependency path information
 *
 * @example
 * ```typescript
 * const paths = findDependencyPaths('MyFunction', edges);
 * console.log('Depends on:', paths.upstream);
 * console.log('Used by:', paths.downstream);
 * ```
 */
export function findDependencyPaths(nodeId: string, edges: CfnEdge[]): DependencyPaths {
  const { dependencies, dependents } = buildAdjacencyMaps(edges)

  // Find all upstream dependencies (what this node depends on)
  const upstream = findReachableNodes(nodeId, dependencies)

  // Find all downstream dependents (what depends on this node)
  const downstream = findReachableNodes(nodeId, dependents)

  // Combine all nodes in the path (including the selected node)
  const allPathNodes = new Set([nodeId, ...upstream, ...downstream])

  // Find all edges connecting these nodes
  const edgeIds = findEdgesInPath(allPathNodes, edges)

  return {
    upstream,
    downstream,
    edgeIds,
  }
}

// =============================================================================
// Graph Metrics
// =============================================================================

/**
 * Extracts the AWS service name from a resource type.
 * Example: "AWS::Lambda::Function" -> "Lambda"
 */
function extractServiceName(resourceType: string): string {
  const parts = resourceType.split('::')
  if (parts.length >= 2 && parts[0] === 'AWS') {
    return parts[1]
  }
  return 'Other'
}

/**
 * Calculates the maximum depth of the dependency graph using topological sort.
 * Returns 0 for graphs with no dependencies.
 */
function calculateMaxDepth(nodes: CfnNode[], edges: CfnEdge[]): number {
  if (nodes.length === 0) return 0

  const { dependencies } = buildAdjacencyMaps(edges)
  const depths = new Map<string, number>()

  // Initialize all nodes with depth 0
  for (const node of nodes) {
    depths.set(node.id, 0)
  }

  // Calculate depths using topological ordering
  let changed = true
  let iterations = 0
  const maxIterations = nodes.length // Prevent infinite loops

  while (changed && iterations < maxIterations) {
    changed = false
    iterations++

    for (const node of nodes) {
      const deps = dependencies.get(node.id)
      if (deps && deps.size > 0) {
        const maxDepDep = Math.max(...Array.from(deps).map((depId) => depths.get(depId) ?? 0))
        const newDepth = maxDepDep + 1

        if (newDepth > (depths.get(node.id) ?? 0)) {
          depths.set(node.id, newDepth)
          changed = true
        }
      }
    }
  }

  return Math.max(...Array.from(depths.values()))
}

/**
 * Detects cycles in the graph using depth-first search.
 * Returns true if any cycle is found.
 */
function detectCycles(nodes: CfnNode[], edges: CfnEdge[]): boolean {
  const { dependencies } = buildAdjacencyMaps(edges)
  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  function hasCycleDFS(nodeId: string): boolean {
    visited.add(nodeId)
    recursionStack.add(nodeId)

    const deps = dependencies.get(nodeId)
    if (deps) {
      for (const depId of deps) {
        if (!visited.has(depId)) {
          if (hasCycleDFS(depId)) {
            return true
          }
        } else if (recursionStack.has(depId)) {
          return true // Back edge found - cycle detected
        }
      }
    }

    recursionStack.delete(nodeId)
    return false
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (hasCycleDFS(node.id)) {
        return true
      }
    }
  }

  return false
}

/**
 * Calculates comprehensive metrics for a CloudFormation graph.
 *
 * @param nodes - All nodes in the graph
 * @param edges - All edges in the graph
 * @returns Graph metrics and statistics
 *
 * @example
 * ```typescript
 * const metrics = calculateGraphMetrics(nodes, edges);
 * console.log(`Total resources: ${metrics.totalResources}`);
 * console.log(`Max depth: ${metrics.maxDepth}`);
 * console.log(`Has cycles: ${metrics.hasCycles}`);
 * ```
 */
export function calculateGraphMetrics(nodes: CfnNode[], edges: CfnEdge[]): GraphMetrics {
  const { dependencies, dependents } = buildAdjacencyMaps(edges)

  // Count resources by service type
  const resourcesByService = new Map<string, number>()
  for (const node of nodes) {
    const service = extractServiceName(node.data.resourceType)
    resourcesByService.set(service, (resourcesByService.get(service) ?? 0) + 1)
  }

  // Count leaf nodes (no dependencies)
  let leafNodes = 0
  for (const node of nodes) {
    const deps = dependencies.get(node.id)
    if (!deps || deps.size === 0) {
      leafNodes++
    }
  }

  // Count root nodes (no dependents)
  let rootNodes = 0
  for (const node of nodes) {
    const deps = dependents.get(node.id)
    if (!deps || deps.size === 0) {
      rootNodes++
    }
  }

  return {
    totalResources: nodes.length,
    totalDependencies: edges.length,
    maxDepth: calculateMaxDepth(nodes, edges),
    resourcesByService,
    leafNodes,
    rootNodes,
    hasCycles: detectCycles(nodes, edges),
  }
}
