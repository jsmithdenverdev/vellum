/**
 * Graph Type Definitions
 *
 * Type definitions for representing CloudFormation templates as React Flow graphs.
 * Extends @xyflow/react types with CFN-specific data structures.
 */

import type { Node, Edge } from "@xyflow/react";

import type { CfnValue } from "@/types/cloudformation";

// =============================================================================
// Node Types
// =============================================================================

/**
 * Data payload for CloudFormation resource nodes.
 * Includes index signature for React Flow compatibility.
 */
export interface CfnNodeData extends Record<string, unknown> {
  /** The logical ID of the resource in the template */
  logicalId: string;
  /** The AWS resource type (e.g., "AWS::Lambda::Function") */
  resourceType: string;
  /** The resource properties from the template */
  properties: Record<string, CfnValue>;
  /** Whether the node is dimmed (not matching search criteria) */
  isDimmed?: boolean;
  /** Whether the node is highlighted (matching search criteria) */
  isHighlighted?: boolean;
}

/**
 * A React Flow node representing a CloudFormation resource.
 * Extends the base Node type with CFN-specific data.
 */
export type CfnNode = Node<CfnNodeData, "cfnResource">;

// =============================================================================
// Edge Types
// =============================================================================

/**
 * Types of references that can create edges between resources
 */
export type RefType = "Ref" | "GetAtt" | "DependsOn";

/**
 * Data payload for CloudFormation dependency edges.
 * Includes index signature for React Flow compatibility.
 */
export interface CfnEdgeData extends Record<string, unknown> {
  /** The type of reference creating this dependency */
  refType: RefType;
  /** For GetAtt references, the attribute being accessed */
  attribute?: string;
}

/**
 * A React Flow edge representing a dependency between CloudFormation resources.
 * Edge direction: Consumer -> Dependency (source uses target)
 */
export type CfnEdge = Edge<CfnEdgeData>;

// =============================================================================
// Graph Data
// =============================================================================

/**
 * Complete graph representation of a CloudFormation template
 */
export interface GraphData {
  /** All resource nodes in the graph */
  nodes: CfnNode[];
  /** All dependency edges in the graph */
  edges: CfnEdge[];
}

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard to check if node data is CfnNodeData.
 * Validates that the data object has the required properties with correct types.
 *
 * @param data - Unknown data to check
 * @returns True if data conforms to CfnNodeData interface
 *
 * @example
 * ```typescript
 * const node = getNode('myNodeId');
 * if (isCfnNodeData(node.data)) {
 *   console.log(node.data.logicalId); // Type-safe access
 * }
 * ```
 */
export function isCfnNodeData(data: unknown): data is CfnNodeData {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const candidate = data as Record<string, unknown>;

  return (
    typeof candidate.logicalId === "string" &&
    typeof candidate.resourceType === "string" &&
    typeof candidate.properties === "object" &&
    candidate.properties !== null
  );
}

/**
 * Type guard to check if a React Flow node is a CfnNode.
 * Validates both the node type and data properties.
 *
 * @param node - React Flow node to check
 * @returns True if node is a CfnNode with valid data
 *
 * @example
 * ```typescript
 * const handleNodeClick = (node: Node) => {
 *   if (isCfnNode(node)) {
 *     // node is now typed as CfnNode
 *     console.log(node.data.resourceType);
 *   }
 * };
 * ```
 */
export function isCfnNode(node: Node): node is CfnNode {
  return node.type === "cfnResource" && isCfnNodeData(node.data);
}

/**
 * Type guard to check if edge data is CfnEdgeData.
 * Validates that the data object has the required refType property.
 *
 * @param data - Unknown data to check
 * @returns True if data conforms to CfnEdgeData interface
 *
 * @example
 * ```typescript
 * const edge = getEdge('myEdgeId');
 * if (isCfnEdgeData(edge.data)) {
 *   console.log(edge.data.refType); // Type-safe access
 * }
 * ```
 */
export function isCfnEdgeData(data: unknown): data is CfnEdgeData {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const candidate = data as Record<string, unknown>;
  const validRefTypes: RefType[] = ["Ref", "GetAtt", "DependsOn"];

  return (
    typeof candidate.refType === "string" &&
    validRefTypes.includes(candidate.refType as RefType) &&
    (candidate.attribute === undefined ||
      typeof candidate.attribute === "string")
  );
}

/**
 * Type guard to check if a React Flow edge is a CfnEdge.
 *
 * @param edge - React Flow edge to check
 * @returns True if edge is a CfnEdge with valid data
 *
 * @example
 * ```typescript
 * const handleEdgeClick = (edge: Edge) => {
 *   if (isCfnEdge(edge)) {
 *     // edge is now typed as CfnEdge
 *     console.log(edge.data.refType);
 *   }
 * };
 * ```
 */
export function isCfnEdge(edge: Edge): edge is CfnEdge {
  // CfnEdge may not have data if it's a simple edge
  return edge.data === undefined || isCfnEdgeData(edge.data);
}

/**
 * Safely extracts CfnNodeData from a React Flow node.
 * Returns undefined if the node doesn't have valid CfnNodeData.
 *
 * @param node - React Flow node
 * @returns The CfnNodeData if valid, undefined otherwise
 *
 * @example
 * ```typescript
 * const nodeData = getCfnNodeData(node);
 * if (nodeData) {
 *   console.log(nodeData.logicalId);
 * }
 * ```
 */
export function getCfnNodeData(node: Node): CfnNodeData | undefined {
  return isCfnNodeData(node.data) ? node.data : undefined;
}
