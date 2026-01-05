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
