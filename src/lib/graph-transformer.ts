/**
 * Graph Transformer
 *
 * Transforms CloudFormation templates into React Flow graph structures
 * by extracting resources as nodes and detecting dependencies as edges.
 */

import type {
  CloudFormationTemplate,
  CfnResource,
  CfnValue,
  GetAttFunction,
} from "@/types/cloudformation";
import { isRef, isGetAtt } from "@/types/cloudformation";
import type { CfnNode, CfnEdge, CfnEdgeData, GraphData, RefType } from "@/types/graph";

// =============================================================================
// Internal Types
// =============================================================================

/**
 * Represents a detected reference within a resource
 */
interface DetectedReference {
  /** The logical ID of the referenced resource */
  targetId: string;
  /** The type of reference */
  refType: RefType;
  /** For GetAtt, the attribute being accessed */
  attribute?: string;
}

// =============================================================================
// Reference Detection
// =============================================================================

/**
 * Extracts the resource logical ID from a Fn::GetAtt value.
 * GetAtt can be either an array [logicalId, attribute] or a dot-separated string.
 */
function extractGetAttTarget(getAttValue: GetAttFunction["Fn::GetAtt"]): {
  logicalId: string;
  attribute: string;
} {
  if (Array.isArray(getAttValue)) {
    return {
      logicalId: getAttValue[0],
      attribute: getAttValue[1],
    };
  }

  // String format: "LogicalId.Attribute"
  const dotIndex = getAttValue.indexOf(".");
  if (dotIndex === -1) {
    return {
      logicalId: getAttValue,
      attribute: "",
    };
  }

  return {
    logicalId: getAttValue.substring(0, dotIndex),
    attribute: getAttValue.substring(dotIndex + 1),
  };
}

/**
 * Recursively scans a value for Ref and Fn::GetAtt intrinsic functions.
 * Collects all detected references for edge creation.
 */
function scanForReferences(value: CfnValue, references: DetectedReference[]): void {
  if (value === null || typeof value !== "object") {
    return;
  }

  // Check for Ref
  if (isRef(value)) {
    references.push({
      targetId: value.Ref,
      refType: "Ref",
    });
    return;
  }

  // Check for Fn::GetAtt
  if (isGetAtt(value)) {
    const { logicalId, attribute } = extractGetAttTarget(value["Fn::GetAtt"]);
    references.push({
      targetId: logicalId,
      refType: "GetAtt",
      attribute,
    });
    return;
  }

  // Recurse into arrays
  if (Array.isArray(value)) {
    for (const item of value) {
      scanForReferences(item, references);
    }
    return;
  }

  // Recurse into objects
  for (const key of Object.keys(value)) {
    scanForReferences((value as Record<string, CfnValue>)[key], references);
  }
}

/**
 * Detects all references from a resource's properties.
 */
function detectPropertyReferences(properties: Record<string, CfnValue> | undefined): DetectedReference[] {
  const references: DetectedReference[] = [];

  if (properties) {
    scanForReferences(properties, references);
  }

  return references;
}

/**
 * Extracts DependsOn references from a resource.
 */
function extractDependsOn(dependsOn: string | string[] | undefined): DetectedReference[] {
  if (!dependsOn) {
    return [];
  }

  const deps = typeof dependsOn === "string" ? [dependsOn] : dependsOn;

  return deps.map((targetId) => ({
    targetId,
    refType: "DependsOn" as const,
  }));
}

// =============================================================================
// Node Generation
// =============================================================================

/**
 * Creates a CfnNode from a resource definition.
 */
function createNode(logicalId: string, resource: CfnResource): CfnNode {
  return {
    id: logicalId,
    type: "cfnResource",
    position: { x: 0, y: 0 },
    data: {
      logicalId,
      resourceType: resource.Type,
      properties: resource.Properties ?? {},
    },
  };
}

// =============================================================================
// Edge Generation
// =============================================================================

/**
 * Creates a unique edge ID from source, target, and reference type.
 */
function createEdgeId(sourceId: string, targetId: string, refType: RefType, attribute?: string): string {
  const base = `${sourceId}-${refType}-${targetId}`;
  return attribute ? `${base}-${attribute}` : base;
}

/**
 * Creates a CfnEdge from a detected reference.
 * Edge direction: source (dependency) -> target (consumer)
 * This creates left-to-right visual flow matching AWS conventions.
 */
function createEdge(
  consumerId: string,
  reference: DetectedReference
): CfnEdge {
  const edgeData: CfnEdgeData = {
    refType: reference.refType,
  };

  if (reference.attribute) {
    edgeData.attribute = reference.attribute;
  }

  // Edge goes FROM dependency TO consumer (left-to-right visual flow)
  return {
    id: createEdgeId(reference.targetId, consumerId, reference.refType, reference.attribute),
    source: reference.targetId,
    target: consumerId,
    data: edgeData,
  };
}

// =============================================================================
// Main Transformer
// =============================================================================

/**
 * Transforms a CloudFormation template into a graph representation.
 *
 * Each resource becomes a node with its logical ID, type, and properties.
 * Dependencies between resources become edges, detected from:
 * - Ref intrinsic functions
 * - Fn::GetAtt intrinsic functions
 * - DependsOn resource attributes
 *
 * Edge direction follows Dependency -> Consumer (arrows point from the
 * referenced resource to the resource using it, creating left-to-right flow).
 *
 * All nodes are initialized at position (0, 0). Use applyDagreLayout to
 * calculate actual positions.
 *
 * @param template - The parsed CloudFormation template
 * @returns Graph data containing nodes and edges
 *
 * @example
 * ```typescript
 * const template = {
 *   Resources: {
 *     MyFunction: {
 *       Type: "AWS::Lambda::Function",
 *       Properties: {
 *         Role: { "Fn::GetAtt": ["MyRole", "Arn"] }
 *       }
 *     },
 *     MyRole: {
 *       Type: "AWS::IAM::Role",
 *       Properties: {}
 *     }
 *   }
 * };
 *
 * const graph = transformToGraph(template);
 * // graph.nodes: [MyFunction node, MyRole node]
 * // graph.edges: [MyRole -> MyFunction (GetAtt)] - dependency points to consumer
 * ```
 */
export function transformToGraph(template: CloudFormationTemplate): GraphData {
  const resourceIds = new Set(Object.keys(template.Resources));
  const nodes: CfnNode[] = [];
  const edges: CfnEdge[] = [];
  const seenEdges = new Set<string>();

  for (const [logicalId, resource] of Object.entries(template.Resources)) {
    // Create node for this resource
    nodes.push(createNode(logicalId, resource));

    // Collect all references (from properties and DependsOn)
    const propertyRefs = detectPropertyReferences(resource.Properties);
    const dependsOnRefs = extractDependsOn(resource.DependsOn);
    const allReferences = [...propertyRefs, ...dependsOnRefs];

    // Create edges only for references to existing resources
    for (const ref of allReferences) {
      // Skip references to non-resources (e.g., Parameters, pseudo-parameters)
      if (!resourceIds.has(ref.targetId)) {
        continue;
      }

      // Skip self-references
      if (ref.targetId === logicalId) {
        continue;
      }

      // Create edge with deduplication
      const edgeId = createEdgeId(logicalId, ref.targetId, ref.refType, ref.attribute);
      if (!seenEdges.has(edgeId)) {
        seenEdges.add(edgeId);
        edges.push(createEdge(logicalId, ref));
      }
    }
  }

  return { nodes, edges };
}
