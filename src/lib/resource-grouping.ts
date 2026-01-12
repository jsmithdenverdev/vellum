/**
 * Resource Grouping
 *
 * Utilities for grouping CloudFormation resources by AWS service type.
 * Supports creating visual clusters in the graph.
 */

import type { CfnNode } from '@/types/graph'

// =============================================================================
// Types
// =============================================================================

/**
 * A group of resources by service type
 */
export interface ResourceGroup {
  /** Service name (e.g., "Lambda", "S3", "DynamoDB") */
  service: string
  /** Display label for the group */
  label: string
  /** Node IDs in this group */
  nodeIds: string[]
  /** Color for visual representation */
  color: string
}

/**
 * Grouping configuration
 */
export interface GroupingConfig {
  /** Whether grouping is enabled */
  enabled: boolean
  /** Minimum nodes required to form a group (default: 2) */
  minGroupSize?: number
}

// =============================================================================
// Service Extraction
// =============================================================================

/**
 * Extracts the AWS service name from a resource type.
 * Example: "AWS::Lambda::Function" -> "Lambda"
 *
 * @param resourceType - The CloudFormation resource type
 * @returns The service name or "Other" for non-AWS resources
 */
export function extractServiceName(resourceType: string): string {
  const parts = resourceType.split('::')
  if (parts.length >= 2 && parts[0] === 'AWS') {
    return parts[1]
  }
  return 'Other'
}

/**
 * Gets a display-friendly label for a service group.
 *
 * @param service - The service name
 * @param count - Number of resources in the group
 * @returns Formatted label
 */
export function getServiceLabel(service: string, count: number): string {
  return `${service} (${count})`
}

// =============================================================================
// Service Colors
// =============================================================================

/**
 * Color palette for AWS service groups.
 * Based on AWS Architecture Icons color scheme.
 */
const SERVICE_COLORS: Record<string, string> = {
  // Compute
  Lambda: '#ff9900',
  EC2: '#ff9900',
  ECS: '#ff9900',
  EKS: '#ff9900',
  Batch: '#ff9900',

  // Storage
  S3: '#569a31',
  EFS: '#569a31',
  FSx: '#569a31',

  // Database
  DynamoDB: '#4053d6',
  RDS: '#4053d6',
  Aurora: '#4053d6',
  ElastiCache: '#4053d6',
  Neptune: '#4053d6',
  DocumentDB: '#4053d6',

  // Networking
  VPC: '#8c4fff',
  CloudFront: '#8c4fff',
  Route53: '#8c4fff',
  APIGateway: '#8c4fff',
  ELB: '#8c4fff',
  ElasticLoadBalancingV2: '#8c4fff',

  // Security
  IAM: '#dd344c',
  Cognito: '#dd344c',
  SecretsManager: '#dd344c',
  KMS: '#dd344c',

  // Application Integration
  SNS: '#e7157b',
  SQS: '#e7157b',
  EventBridge: '#e7157b',
  StepFunctions: '#e7157b',

  // Analytics
  Kinesis: '#8c4fff',
  Athena: '#8c4fff',
  Glue: '#8c4fff',

  // Developer Tools
  CodeBuild: '#4b612c',
  CodeDeploy: '#4b612c',
  CodePipeline: '#4b612c',

  // Management
  CloudWatch: '#759c3e',
  CloudFormation: '#759c3e',
  Systems: '#759c3e',

  // Default
  Other: '#687078',
}

/**
 * Gets the color for a service group.
 *
 * @param service - The service name
 * @returns Hex color code
 */
export function getServiceColor(service: string): string {
  return SERVICE_COLORS[service] ?? SERVICE_COLORS.Other
}

// =============================================================================
// Grouping Logic
// =============================================================================

/**
 * Groups nodes by AWS service type.
 *
 * @param nodes - All nodes in the graph
 * @param config - Grouping configuration
 * @returns Array of resource groups
 *
 * @example
 * ```typescript
 * const groups = groupNodesByService(nodes, { enabled: true, minGroupSize: 2 });
 * groups.forEach(group => {
 *   console.log(`${group.label}: ${group.nodeIds.length} resources`);
 * });
 * ```
 */
export function groupNodesByService(
  nodes: CfnNode[],
  config: GroupingConfig = { enabled: true, minGroupSize: 2 }
): ResourceGroup[] {
  if (!config.enabled) {
    return []
  }

  const minSize = config.minGroupSize ?? 2

  // Group nodes by service
  const serviceMap = new Map<string, string[]>()

  for (const node of nodes) {
    const service = extractServiceName(node.data.resourceType)
    if (!serviceMap.has(service)) {
      serviceMap.set(service, [])
    }
    serviceMap.get(service)!.push(node.id)
  }

  // Create groups only for services with enough nodes
  const groups: ResourceGroup[] = []

  for (const [service, nodeIds] of serviceMap.entries()) {
    if (nodeIds.length >= minSize) {
      groups.push({
        service,
        label: getServiceLabel(service, nodeIds.length),
        nodeIds,
        color: getServiceColor(service),
      })
    }
  }

  // Sort by node count (descending) for consistent ordering
  groups.sort((a, b) => b.nodeIds.length - a.nodeIds.length)

  return groups
}

/**
 * Gets the group for a specific node.
 *
 * @param nodeId - The node ID to find
 * @param groups - All resource groups
 * @returns The group containing the node, or undefined
 */
export function getNodeGroup(nodeId: string, groups: ResourceGroup[]): ResourceGroup | undefined {
  return groups.find((group) => group.nodeIds.includes(nodeId))
}

/**
 * Checks if a node belongs to any group.
 *
 * @param nodeId - The node ID to check
 * @param groups - All resource groups
 * @returns True if the node is in a group
 */
export function isNodeGrouped(nodeId: string, groups: ResourceGroup[]): boolean {
  return groups.some((group) => group.nodeIds.includes(nodeId))
}
