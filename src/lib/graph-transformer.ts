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
  SubFunction,
} from "../types/cloudformation";
import { isRef, isGetAtt, isSub } from "../types/cloudformation";
import type { CfnNode, CfnEdge, CfnEdgeData, GraphData, RefType } from "../types/graph";

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

// =============================================================================
// Fn::Sub Variable Detection
// =============================================================================

/**
 * AWS pseudo-parameters that should be skipped when detecting Fn::Sub references.
 * These are not references to resources in the template.
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/pseudo-parameter-reference.html
 */
const AWS_PSEUDO_PARAMETERS = new Set([
  "AWS::AccountId",
  "AWS::NotificationARNs",
  "AWS::NoValue",
  "AWS::Partition",
  "AWS::Region",
  "AWS::StackId",
  "AWS::StackName",
  "AWS::URLSuffix",
]);

/**
 * Regex pattern to match ${VarName} or ${VarName.Attribute} in Fn::Sub strings.
 * Captures the variable name and optional attribute after a dot.
 * Does not match literal ${!VarName} which are escaped in Fn::Sub.
 */
const FN_SUB_VARIABLE_PATTERN = /\$\{([^!][^}]*)\}/g;

/**
 * Parses a Fn::Sub template string and extracts variable references.
 * Variables in ${VarName} format are detected as Ref-type dependencies.
 * Variables in ${VarName.Attribute} format are detected as GetAtt-type dependencies.
 * AWS pseudo-parameters (like ${AWS::Region}) are skipped.
 *
 * @param templateString - The Fn::Sub template string to parse
 * @returns Array of detected references
 */
function extractSubStringReferences(templateString: string): DetectedReference[] {
  const references: DetectedReference[] = [];
  let match: RegExpExecArray | null;

  // Reset regex state for each call
  FN_SUB_VARIABLE_PATTERN.lastIndex = 0;

  while ((match = FN_SUB_VARIABLE_PATTERN.exec(templateString)) !== null) {
    const variableExpr = match[1];

    // Check if this is a pseudo-parameter
    if (AWS_PSEUDO_PARAMETERS.has(variableExpr)) {
      continue;
    }

    // Check if this is a GetAtt-style reference (contains a dot)
    const dotIndex = variableExpr.indexOf(".");
    if (dotIndex !== -1) {
      const logicalId = variableExpr.substring(0, dotIndex);
      const attribute = variableExpr.substring(dotIndex + 1);

      // Skip if the logicalId part is a pseudo-parameter prefix
      if (logicalId === "AWS") {
        continue;
      }

      references.push({
        targetId: logicalId,
        refType: "GetAtt",
        attribute,
      });
    } else {
      // Simple variable reference (Ref-style)
      references.push({
        targetId: variableExpr,
        refType: "Ref",
      });
    }
  }

  return references;
}

/**
 * Extracts references from a Fn::Sub intrinsic function.
 * Handles both simple string form and array form with substitution map.
 *
 * Simple form: { "Fn::Sub": "arn:aws:s3:::${MyBucket}/*" }
 * Array form: { "Fn::Sub": ["${BucketName}/*", { "BucketName": { "Ref": "MyBucket" } }] }
 *
 * @param subValue - The value of the Fn::Sub function
 * @param allReferences - Array to collect detected references into
 */
function extractSubReferences(
  subValue: SubFunction["Fn::Sub"],
  allReferences: DetectedReference[]
): void {
  if (typeof subValue === "string") {
    // Simple form: just a template string
    const refs = extractSubStringReferences(subValue);
    allReferences.push(...refs);
  } else if (Array.isArray(subValue) && subValue.length >= 1) {
    // Array form: [templateString, substitutionMap]
    const templateString = subValue[0];

    if (typeof templateString === "string") {
      // Extract references from template string
      const templateRefs = extractSubStringReferences(templateString);

      // If there's a substitution map, the variables in the template string
      // refer to the map keys, not directly to resources. The map values
      // may contain Refs/GetAtts that we need to scan.
      if (subValue.length >= 2 && typeof subValue[1] === "object" && subValue[1] !== null) {
        const substitutionMap = subValue[1] as Record<string, CfnValue>;
        const mapKeys = new Set(Object.keys(substitutionMap));

        // Only add template refs that are NOT defined in the substitution map
        // (those are local variable definitions, not resource references)
        for (const ref of templateRefs) {
          if (!mapKeys.has(ref.targetId)) {
            allReferences.push(ref);
          }
        }

        // Scan the substitution map values for Ref/GetAtt/Sub intrinsics
        // These will be picked up by the recursive scanForReferences call
        // since we continue scanning after handling Fn::Sub
      } else {
        // No substitution map, all template refs are resource references
        allReferences.push(...templateRefs);
      }
    }
  }
}

/**
 * Recursively scans a value for Ref, Fn::GetAtt, and Fn::Sub intrinsic functions.
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

  // Check for Fn::Sub
  if (isSub(value)) {
    extractSubReferences(value["Fn::Sub"], references);

    // Continue scanning for nested intrinsics in the substitution map
    const subValue = value["Fn::Sub"];
    if (Array.isArray(subValue) && subValue.length >= 2) {
      const substitutionMap = subValue[1];
      if (typeof substitutionMap === "object" && substitutionMap !== null) {
        for (const key of Object.keys(substitutionMap)) {
          scanForReferences(
            (substitutionMap as Record<string, CfnValue>)[key],
            references
          );
        }
      }
    }
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
