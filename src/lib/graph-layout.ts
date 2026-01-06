/**
 * Graph Layout
 *
 * Applies automatic layout to CloudFormation graph nodes using Dagre.
 * Calculates optimal node positions for a left-to-right dependency flow.
 */

import Dagre from "@dagrejs/dagre";

import type { CfnNode, CfnEdge } from "@/types/graph";

// =============================================================================
// Constants
// =============================================================================

/** Width for resource nodes (matches ResourceNode component) */
const NODE_WIDTH = 220;

/** Height for resource nodes */
const NODE_HEIGHT = 60;

// =============================================================================
// Layout Function
// =============================================================================

/**
 * Applies Dagre layout to calculate node positions.
 *
 * Uses left-to-right (LR) direction to create a clear dependency
 * hierarchy visualization where dependencies appear on the left
 * and consumers appear on the right.
 *
 * @param nodes - The graph nodes to layout
 * @param edges - The graph edges connecting nodes
 * @returns A new array of nodes with updated x, y positions
 *
 * @example
 * ```typescript
 * const graph = transformToGraph(template);
 * const layoutedNodes = applyDagreLayout(graph.nodes, graph.edges);
 * // layoutedNodes now have calculated x, y positions
 * ```
 */
export function applyDagreLayout(
  nodes: CfnNode[],
  edges: CfnEdge[]
): CfnNode[] {
  // Handle empty graph
  if (nodes.length === 0) {
    return [];
  }

  // Create a new directed graph
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

  // Configure the graph layout
  g.setGraph({
    rankdir: "LR", // Left-to-right (matches our node handles)
    nodesep: 50, // Vertical spacing between nodes in same rank
    ranksep: 100, // Horizontal spacing between ranks (layers)
    marginx: 20,
    marginy: 20,
  });

  // Add nodes to the graph
  nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  // Add edges to the graph
  // Edges go Dependency → Consumer, and Dagre places sources in earlier ranks.
  // This naturally produces left-to-right layout (dependencies on left).
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  // Run the layout algorithm
  Dagre.layout(g);

  // Map positions back to nodes
  // Dagre uses center coordinates, React Flow uses top-left
  return nodes.map((node) => {
    const dagreNode = g.node(node.id);
    return {
      ...node,
      position: {
        x: dagreNode.x - NODE_WIDTH / 2,
        y: dagreNode.y - NODE_HEIGHT / 2,
      },
    };
  });
}

/**
 * Applies layout to a graph and returns the complete updated graph data.
 *
 * This is a convenience function that wraps applyDagreLayout and returns
 * both nodes and edges together.
 *
 * @param nodes - The graph nodes to layout
 * @param edges - The graph edges connecting nodes
 * @returns Updated graph data with positioned nodes
 */
export function layoutGraph(
  nodes: CfnNode[],
  edges: CfnEdge[]
): { nodes: CfnNode[]; edges: CfnEdge[] } {
  const layoutedNodes = applyDagreLayout(nodes, edges);
  return {
    nodes: layoutedNodes,
    edges,
  };
}
