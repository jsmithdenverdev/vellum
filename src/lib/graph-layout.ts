/**
 * Graph Layout
 *
 * Applies automatic layout to CloudFormation graph nodes using ELK.js.
 * Calculates optimal node positions for a top-to-bottom dependency flow.
 */

import ELK from "elkjs/lib/elk.bundled.js";
import type { ElkNode, ElkExtendedEdge, LayoutOptions } from "elkjs";

import type { CfnNode, CfnEdge } from "@/types/graph";

// =============================================================================
// Constants
// =============================================================================

/** Default width for resource nodes */
const DEFAULT_NODE_WIDTH = 200;

/** Default height for resource nodes */
const DEFAULT_NODE_HEIGHT = 80;

/** Horizontal spacing between nodes */
const NODE_SPACING_HORIZONTAL = 100;

/** Vertical spacing between nodes */
const NODE_SPACING_VERTICAL = 80;

// =============================================================================
// ELK Configuration
// =============================================================================

/**
 * ELK layout options for layered top-to-bottom layout
 */
const layoutOptions: LayoutOptions = {
  "elk.algorithm": "layered",
  "elk.direction": "DOWN",
  "elk.spacing.nodeNode": String(NODE_SPACING_HORIZONTAL),
  "elk.layered.spacing.nodeNodeBetweenLayers": String(NODE_SPACING_VERTICAL),
  "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
  "elk.edgeRouting": "ORTHOGONAL",
};

// =============================================================================
// Layout Function
// =============================================================================

/**
 * Applies ELK.js layout to calculate node positions.
 *
 * Uses the 'layered' algorithm with top-to-bottom (DOWN) direction
 * to create a clear dependency hierarchy visualization.
 *
 * @param nodes - The graph nodes to layout
 * @param edges - The graph edges connecting nodes
 * @returns A new array of nodes with updated x, y positions
 *
 * @example
 * ```typescript
 * const graph = transformToGraph(template);
 * const layoutedNodes = await applyElkLayout(graph.nodes, graph.edges);
 * // layoutedNodes now have calculated x, y positions
 * ```
 */
export async function applyElkLayout(
  nodes: CfnNode[],
  edges: CfnEdge[]
): Promise<CfnNode[]> {
  // Handle empty graph
  if (nodes.length === 0) {
    return [];
  }

  const elk = new ELK();

  // Convert nodes to ELK format
  const elkNodes: ElkNode[] = nodes.map((node) => ({
    id: node.id,
    width: DEFAULT_NODE_WIDTH,
    height: DEFAULT_NODE_HEIGHT,
  }));

  // Convert edges to ELK format
  const elkEdges: ElkExtendedEdge[] = edges.map((edge) => ({
    id: edge.id,
    sources: [edge.source],
    targets: [edge.target],
  }));

  // Create ELK graph
  const elkGraph: ElkNode = {
    id: "root",
    layoutOptions,
    children: elkNodes,
    edges: elkEdges,
  };

  // Apply layout
  const layoutedGraph = await elk.layout(elkGraph);

  // Create a map of node positions from ELK result
  const positionMap = new Map<string, { x: number; y: number }>();

  for (const elkNode of layoutedGraph.children ?? []) {
    positionMap.set(elkNode.id, {
      x: elkNode.x ?? 0,
      y: elkNode.y ?? 0,
    });
  }

  // Return new nodes with updated positions
  return nodes.map((node) => {
    const position = positionMap.get(node.id) ?? { x: 0, y: 0 };
    return {
      ...node,
      position,
    };
  });
}

/**
 * Applies layout to a graph and returns the complete updated graph data.
 *
 * This is a convenience function that wraps applyElkLayout and returns
 * both nodes and edges together.
 *
 * @param nodes - The graph nodes to layout
 * @param edges - The graph edges connecting nodes
 * @returns Updated graph data with positioned nodes
 */
export async function layoutGraph(
  nodes: CfnNode[],
  edges: CfnEdge[]
): Promise<{ nodes: CfnNode[]; edges: CfnEdge[] }> {
  const layoutedNodes = await applyElkLayout(nodes, edges);
  return {
    nodes: layoutedNodes,
    edges,
  };
}
