/**
 * ResourceNode Component
 *
 * Custom React Flow node for displaying CloudFormation resources.
 * Uses Cloudscape-inspired styling for consistency with the UI.
 */

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { CfnNodeData } from "@/types/graph";

// =============================================================================
// Service Colors
// =============================================================================

/**
 * Color mapping for AWS services (subset of common services)
 * Uses colors that complement Cloudscape design
 */
const SERVICE_COLORS: Record<string, { bg: string; border: string }> = {
  EC2: { bg: "#ff9900", border: "#cc7a00" },
  S3: { bg: "#569a31", border: "#3d6d23" },
  Lambda: { bg: "#ff9900", border: "#cc7a00" },
  DynamoDB: { bg: "#4053d6", border: "#2e3ca6" },
  RDS: { bg: "#4053d6", border: "#2e3ca6" },
  IAM: { bg: "#dd344c", border: "#a82639" },
  VPC: { bg: "#8c4fff", border: "#6b3cc7" },
  CloudFormation: { bg: "#e63b5f", border: "#b82d4a" },
  SNS: { bg: "#d93d6e", border: "#a82f56" },
  SQS: { bg: "#d93d6e", border: "#a82f56" },
  CloudWatch: { bg: "#e63b5f", border: "#b82d4a" },
  APIGateway: { bg: "#ff4f8b", border: "#cc3f70" },
  CloudFront: { bg: "#8c4fff", border: "#6b3cc7" },
  Route53: { bg: "#8c4fff", border: "#6b3cc7" },
  ECS: { bg: "#ff9900", border: "#cc7a00" },
  EKS: { bg: "#ff9900", border: "#cc7a00" },
  Logs: { bg: "#e63b5f", border: "#b82d4a" },
  Events: { bg: "#e63b5f", border: "#b82d4a" },
  StepFunctions: { bg: "#ff4f8b", border: "#cc3f70" },
  Cognito: { bg: "#dd344c", border: "#a82639" },
  SecretsManager: { bg: "#dd344c", border: "#a82639" },
  KMS: { bg: "#dd344c", border: "#a82639" },
  ElasticLoadBalancingV2: { bg: "#8c4fff", border: "#6b3cc7" },
  AutoScaling: { bg: "#ff9900", border: "#cc7a00" },
  Custom: { bg: "#687078", border: "#4a5157" },
  Unknown: { bg: "#687078", border: "#4a5157" },
};

/**
 * Extracts the AWS service name from a resource type
 * e.g., "AWS::EC2::Instance" -> "EC2"
 */
function extractService(resourceType: string): string {
  const parts = resourceType.split("::");
  if (parts.length >= 2 && parts[0] === "AWS") {
    return parts[1];
  }
  if (resourceType.startsWith("Custom::")) {
    return "Custom";
  }
  return "Unknown";
}

/**
 * Extracts the resource name from a resource type
 * e.g., "AWS::EC2::Instance" -> "Instance"
 */
function extractResourceName(resourceType: string): string {
  const parts = resourceType.split("::");
  if (parts.length >= 3) {
    return parts.slice(2).join("::");
  }
  if (parts.length === 2) {
    return parts[1];
  }
  return resourceType;
}

/**
 * Gets the color scheme for a service, falling back to default
 */
function getServiceColors(service: string): { bg: string; border: string } {
  return SERVICE_COLORS[service] ?? SERVICE_COLORS.Unknown;
}

// =============================================================================
// Styles
// =============================================================================

const nodeStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "8px 12px",
  backgroundColor: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  minWidth: "180px",
  maxWidth: "240px",
  fontSize: "13px",
  fontFamily:
    '"Amazon Ember", "Helvetica Neue", Roboto, Arial, sans-serif',
  transition: "box-shadow 0.2s ease, border-color 0.2s ease",
};

const nodeStylesSelected: React.CSSProperties = {
  ...nodeStyles,
  borderColor: "#0972d3",
  boxShadow: "0 0 0 2px rgba(9, 114, 211, 0.3), 0 2px 4px rgba(0, 0, 0, 0.15)",
};

const iconContainerStyles = (colors: {
  bg: string;
  border: string;
}): React.CSSProperties => ({
  width: "32px",
  height: "32px",
  borderRadius: "6px",
  backgroundColor: colors.bg,
  border: `1px solid ${colors.border}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  color: "#ffffff",
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.5px",
});

const contentStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "2px",
  overflow: "hidden",
  minWidth: 0,
};

const labelStyles: React.CSSProperties = {
  fontWeight: 600,
  color: "#16191f",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  lineHeight: "1.3",
};

const typeStyles: React.CSSProperties = {
  fontSize: "11px",
  color: "#5f6b7a",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  lineHeight: "1.2",
};

const handleStyles: React.CSSProperties = {
  width: "8px",
  height: "8px",
  backgroundColor: "#687078",
  border: "2px solid #ffffff",
};

// =============================================================================
// Component
// =============================================================================

/**
 * Gets the abbreviated service name for the icon
 */
function getServiceAbbr(service: string): string {
  const abbrs: Record<string, string> = {
    EC2: "EC2",
    S3: "S3",
    Lambda: "LMB",
    DynamoDB: "DDB",
    RDS: "RDS",
    IAM: "IAM",
    VPC: "VPC",
    CloudFormation: "CFN",
    SNS: "SNS",
    SQS: "SQS",
    CloudWatch: "CW",
    APIGateway: "API",
    CloudFront: "CF",
    Route53: "R53",
    ECS: "ECS",
    EKS: "EKS",
    Logs: "LOG",
    Events: "EVT",
    StepFunctions: "SFN",
    Cognito: "COG",
    SecretsManager: "SM",
    KMS: "KMS",
    ElasticLoadBalancingV2: "ELB",
    AutoScaling: "ASG",
    Custom: "CST",
  };
  return abbrs[service] ?? service.substring(0, 3).toUpperCase();
}

// Define the node type for this component
type CfnResourceNode = Node<CfnNodeData, "cfnResource">;

/**
 * Custom React Flow node component for CloudFormation resources
 */
function ResourceNodeComponent({
  data,
  selected,
}: NodeProps<CfnResourceNode>) {
  const service = extractService(data.resourceType);
  const resourceName = extractResourceName(data.resourceType);
  const colors = getServiceColors(service);
  const abbr = getServiceAbbr(service);

  return (
    <div style={{ position: "relative" }}>
      {/* Input handle (left side - receives dependencies) */}
      <Handle
        type="target"
        position={Position.Left}
        style={handleStyles}
      />

      {/* Node content */}
      <div style={selected ? nodeStylesSelected : nodeStyles}>
        {/* Service icon placeholder */}
        <div style={iconContainerStyles(colors)}>{abbr}</div>

        {/* Resource info */}
        <div style={contentStyles}>
          <div style={labelStyles} title={data.logicalId}>
            {data.logicalId}
          </div>
          <div style={typeStyles} title={data.resourceType}>
            {resourceName}
          </div>
        </div>
      </div>

      {/* Output handle (right side - provides dependencies) */}
      <Handle
        type="source"
        position={Position.Right}
        style={handleStyles}
      />
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const ResourceNode = memo(ResourceNodeComponent);
