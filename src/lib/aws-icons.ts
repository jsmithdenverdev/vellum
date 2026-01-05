/**
 * AWS Service Icons and Color Mapping
 *
 * Maps CloudFormation resource types to AWS service information
 * including colors that match AWS branding guidelines.
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Category of AWS service for grouping and theming
 */
export type ServiceCategory =
  | "compute"
  | "storage"
  | "database"
  | "networking"
  | "security"
  | "integration"
  | "management"
  | "analytics"
  | "other";

/**
 * Information about an AWS service including display name, color, and category
 */
export interface ServiceInfo {
  /** Display name of the service */
  name: string;
  /** AWS brand color for the service (hex) */
  color: string;
  /** Darker shade for borders/accents */
  borderColor: string;
  /** Service category for grouping */
  category: ServiceCategory;
  /** Short abbreviation for icon display (fallback) */
  abbreviation: string;
  /** Icon filename from aws-icons package */
  iconFile?: string;
}

// =============================================================================
// AWS Service Colors (based on AWS Architecture Icons guidelines)
// =============================================================================

const AWS_COLORS = {
  // Compute - Orange
  orange: { main: "#FF9900", border: "#CC7A00" },
  // Storage - Green
  green: { main: "#569A31", border: "#3D6D23" },
  // Database - Blue
  blue: { main: "#3B48CC", border: "#2D37A0" },
  // Security/Identity - Red
  red: { main: "#DD344C", border: "#A82639" },
  // Networking - Purple
  purple: { main: "#8C4FFF", border: "#6B3CC7" },
  // Integration/Application - Pink
  pink: { main: "#E7157B", border: "#B8115F" },
  // Management - Pink (CloudFormation, CloudWatch)
  managementPink: { main: "#E63B5F", border: "#B82D4A" },
  // Default - Gray
  gray: { main: "#687078", border: "#4A5157" },
} as const;

// =============================================================================
// Service Definitions
// =============================================================================

/**
 * Mapping of AWS service names to their info
 */
const SERVICE_DEFINITIONS: Record<string, ServiceInfo> = {
  // Compute Services
  EC2: {
    name: "EC2",
    color: AWS_COLORS.orange.main,
    borderColor: AWS_COLORS.orange.border,
    category: "compute",
    abbreviation: "EC2",
    iconFile: "AmazonEC2",
  },
  Lambda: {
    name: "Lambda",
    color: AWS_COLORS.orange.main,
    borderColor: AWS_COLORS.orange.border,
    category: "compute",
    abbreviation: "LMB",
    iconFile: "AWSLambda",
  },
  ECS: {
    name: "ECS",
    color: AWS_COLORS.orange.main,
    borderColor: AWS_COLORS.orange.border,
    category: "compute",
    abbreviation: "ECS",
    iconFile: "AmazonElasticContainerService",
  },
  EKS: {
    name: "EKS",
    color: AWS_COLORS.orange.main,
    borderColor: AWS_COLORS.orange.border,
    category: "compute",
    abbreviation: "EKS",
    iconFile: "AmazonElasticKubernetesService",
  },
  AutoScaling: {
    name: "Auto Scaling",
    color: AWS_COLORS.orange.main,
    borderColor: AWS_COLORS.orange.border,
    category: "compute",
    abbreviation: "ASG",
    iconFile: "AmazonEC2AutoScaling",
  },
  Batch: {
    name: "Batch",
    color: AWS_COLORS.orange.main,
    borderColor: AWS_COLORS.orange.border,
    category: "compute",
    abbreviation: "BAT",
    iconFile: "AWSBatch",
  },
  ElasticBeanstalk: {
    name: "Elastic Beanstalk",
    color: AWS_COLORS.orange.main,
    borderColor: AWS_COLORS.orange.border,
    category: "compute",
    abbreviation: "EB",
    iconFile: "AWSElasticBeanstalk",
  },

  // Storage Services
  S3: {
    name: "S3",
    color: AWS_COLORS.green.main,
    borderColor: AWS_COLORS.green.border,
    category: "storage",
    abbreviation: "S3",
    iconFile: "AmazonSimpleStorageService",
  },
  EFS: {
    name: "EFS",
    color: AWS_COLORS.green.main,
    borderColor: AWS_COLORS.green.border,
    category: "storage",
    abbreviation: "EFS",
    iconFile: "AmazonElasticFileSystem",
  },
  EBS: {
    name: "EBS",
    color: AWS_COLORS.green.main,
    borderColor: AWS_COLORS.green.border,
    category: "storage",
    abbreviation: "EBS",
    iconFile: "AmazonElasticBlockStore",
  },
  Glacier: {
    name: "S3 Glacier",
    color: AWS_COLORS.green.main,
    borderColor: AWS_COLORS.green.border,
    category: "storage",
    abbreviation: "GLC",
    iconFile: "AmazonSimpleStorageServiceGlacier",
  },
  Backup: {
    name: "Backup",
    color: AWS_COLORS.green.main,
    borderColor: AWS_COLORS.green.border,
    category: "storage",
    abbreviation: "BKP",
    iconFile: "AWSBackup",
  },

  // Database Services
  DynamoDB: {
    name: "DynamoDB",
    color: AWS_COLORS.blue.main,
    borderColor: AWS_COLORS.blue.border,
    category: "database",
    abbreviation: "DDB",
    iconFile: "AmazonDynamoDB",
  },
  RDS: {
    name: "RDS",
    color: AWS_COLORS.blue.main,
    borderColor: AWS_COLORS.blue.border,
    category: "database",
    abbreviation: "RDS",
    iconFile: "AmazonRDS",
  },
  Aurora: {
    name: "Aurora",
    color: AWS_COLORS.blue.main,
    borderColor: AWS_COLORS.blue.border,
    category: "database",
    abbreviation: "AUR",
    iconFile: "AmazonAurora",
  },
  ElastiCache: {
    name: "ElastiCache",
    color: AWS_COLORS.blue.main,
    borderColor: AWS_COLORS.blue.border,
    category: "database",
    abbreviation: "EC",
    iconFile: "AmazonElastiCache",
  },
  Redshift: {
    name: "Redshift",
    color: AWS_COLORS.blue.main,
    borderColor: AWS_COLORS.blue.border,
    category: "database",
    abbreviation: "RS",
    iconFile: "AmazonRedshift",
  },
  Neptune: {
    name: "Neptune",
    color: AWS_COLORS.blue.main,
    borderColor: AWS_COLORS.blue.border,
    category: "database",
    abbreviation: "NEP",
    iconFile: "AmazonNeptune",
  },
  DocumentDB: {
    name: "DocumentDB",
    color: AWS_COLORS.blue.main,
    borderColor: AWS_COLORS.blue.border,
    category: "database",
    abbreviation: "DOC",
    iconFile: "AmazonDocumentDB",
  },

  // Security & Identity Services
  IAM: {
    name: "IAM",
    color: AWS_COLORS.red.main,
    borderColor: AWS_COLORS.red.border,
    category: "security",
    abbreviation: "IAM",
    iconFile: "AWSIdentityandAccessManagement",
  },
  Cognito: {
    name: "Cognito",
    color: AWS_COLORS.red.main,
    borderColor: AWS_COLORS.red.border,
    category: "security",
    abbreviation: "COG",
    iconFile: "AmazonCognito",
  },
  SecretsManager: {
    name: "Secrets Manager",
    color: AWS_COLORS.red.main,
    borderColor: AWS_COLORS.red.border,
    category: "security",
    abbreviation: "SM",
    iconFile: "AWSSecretsManager",
  },
  KMS: {
    name: "KMS",
    color: AWS_COLORS.red.main,
    borderColor: AWS_COLORS.red.border,
    category: "security",
    abbreviation: "KMS",
    iconFile: "AWSKeyManagementService",
  },
  WAF: {
    name: "WAF",
    color: AWS_COLORS.red.main,
    borderColor: AWS_COLORS.red.border,
    category: "security",
    abbreviation: "WAF",
    iconFile: "AWSWAF",
  },
  WAFv2: {
    name: "WAF",
    color: AWS_COLORS.red.main,
    borderColor: AWS_COLORS.red.border,
    category: "security",
    abbreviation: "WAF",
    iconFile: "AWSWAF",
  },
  Shield: {
    name: "Shield",
    color: AWS_COLORS.red.main,
    borderColor: AWS_COLORS.red.border,
    category: "security",
    abbreviation: "SHD",
    iconFile: "AWSShield",
  },
  ACM: {
    name: "ACM",
    color: AWS_COLORS.red.main,
    borderColor: AWS_COLORS.red.border,
    category: "security",
    abbreviation: "ACM",
    iconFile: "AWSCertificateManager",
  },
  CertificateManager: {
    name: "ACM",
    color: AWS_COLORS.red.main,
    borderColor: AWS_COLORS.red.border,
    category: "security",
    abbreviation: "ACM",
    iconFile: "AWSCertificateManager",
  },

  // Networking Services
  VPC: {
    name: "VPC",
    color: AWS_COLORS.purple.main,
    borderColor: AWS_COLORS.purple.border,
    category: "networking",
    abbreviation: "VPC",
    iconFile: "AmazonVirtualPrivateCloud",
  },
  CloudFront: {
    name: "CloudFront",
    color: AWS_COLORS.purple.main,
    borderColor: AWS_COLORS.purple.border,
    category: "networking",
    abbreviation: "CF",
    iconFile: "AmazonCloudFront",
  },
  Route53: {
    name: "Route 53",
    color: AWS_COLORS.purple.main,
    borderColor: AWS_COLORS.purple.border,
    category: "networking",
    abbreviation: "R53",
    iconFile: "AmazonRoute53",
  },
  ElasticLoadBalancing: {
    name: "ELB",
    color: AWS_COLORS.purple.main,
    borderColor: AWS_COLORS.purple.border,
    category: "networking",
    abbreviation: "ELB",
    iconFile: "ElasticLoadBalancing",
  },
  ElasticLoadBalancingV2: {
    name: "ELB",
    color: AWS_COLORS.purple.main,
    borderColor: AWS_COLORS.purple.border,
    category: "networking",
    abbreviation: "ELB",
    iconFile: "ElasticLoadBalancing",
  },
  APIGateway: {
    name: "API Gateway",
    color: AWS_COLORS.pink.main,
    borderColor: AWS_COLORS.pink.border,
    category: "integration",
    abbreviation: "API",
    iconFile: "AmazonAPIGateway",
  },
  ApiGateway: {
    name: "API Gateway",
    color: AWS_COLORS.pink.main,
    borderColor: AWS_COLORS.pink.border,
    category: "integration",
    abbreviation: "API",
    iconFile: "AmazonAPIGateway",
  },
  ApiGatewayV2: {
    name: "API Gateway",
    color: AWS_COLORS.pink.main,
    borderColor: AWS_COLORS.pink.border,
    category: "integration",
    abbreviation: "API",
    iconFile: "AmazonAPIGateway",
  },
  DirectConnect: {
    name: "Direct Connect",
    color: AWS_COLORS.purple.main,
    borderColor: AWS_COLORS.purple.border,
    category: "networking",
    abbreviation: "DX",
    iconFile: "AWSDirectConnect",
  },
  GlobalAccelerator: {
    name: "Global Accelerator",
    color: AWS_COLORS.purple.main,
    borderColor: AWS_COLORS.purple.border,
    category: "networking",
    abbreviation: "GA",
    iconFile: "AWSGlobalAccelerator",
  },

  // Integration Services
  SNS: {
    name: "SNS",
    color: AWS_COLORS.pink.main,
    borderColor: AWS_COLORS.pink.border,
    category: "integration",
    abbreviation: "SNS",
    iconFile: "AmazonSimpleNotificationService",
  },
  SQS: {
    name: "SQS",
    color: AWS_COLORS.pink.main,
    borderColor: AWS_COLORS.pink.border,
    category: "integration",
    abbreviation: "SQS",
    iconFile: "AmazonSimpleQueueService",
  },
  StepFunctions: {
    name: "Step Functions",
    color: AWS_COLORS.pink.main,
    borderColor: AWS_COLORS.pink.border,
    category: "integration",
    abbreviation: "SFN",
    iconFile: "AWSStepFunctions",
  },
  EventBridge: {
    name: "EventBridge",
    color: AWS_COLORS.pink.main,
    borderColor: AWS_COLORS.pink.border,
    category: "integration",
    abbreviation: "EB",
    iconFile: "AmazonEventBridge",
  },
  Events: {
    name: "EventBridge",
    color: AWS_COLORS.pink.main,
    borderColor: AWS_COLORS.pink.border,
    category: "integration",
    abbreviation: "EVT",
    iconFile: "AmazonEventBridge",
  },
  AppSync: {
    name: "AppSync",
    color: AWS_COLORS.pink.main,
    borderColor: AWS_COLORS.pink.border,
    category: "integration",
    abbreviation: "AS",
    iconFile: "AWSAppSync",
  },

  // Management & Governance
  CloudFormation: {
    name: "CloudFormation",
    color: AWS_COLORS.managementPink.main,
    borderColor: AWS_COLORS.managementPink.border,
    category: "management",
    abbreviation: "CFN",
    iconFile: "AWSCloudFormation",
  },
  CloudWatch: {
    name: "CloudWatch",
    color: AWS_COLORS.managementPink.main,
    borderColor: AWS_COLORS.managementPink.border,
    category: "management",
    abbreviation: "CW",
    iconFile: "AmazonCloudWatch",
  },
  Logs: {
    name: "CloudWatch Logs",
    color: AWS_COLORS.managementPink.main,
    borderColor: AWS_COLORS.managementPink.border,
    category: "management",
    abbreviation: "LOG",
    iconFile: "AmazonCloudWatch",
  },
  CloudTrail: {
    name: "CloudTrail",
    color: AWS_COLORS.managementPink.main,
    borderColor: AWS_COLORS.managementPink.border,
    category: "management",
    abbreviation: "CT",
    iconFile: "AWSCloudTrail",
  },
  Config: {
    name: "Config",
    color: AWS_COLORS.managementPink.main,
    borderColor: AWS_COLORS.managementPink.border,
    category: "management",
    abbreviation: "CFG",
    iconFile: "AWSConfig",
  },
  SSM: {
    name: "Systems Manager",
    color: AWS_COLORS.managementPink.main,
    borderColor: AWS_COLORS.managementPink.border,
    category: "management",
    abbreviation: "SSM",
    iconFile: "AWSSystemsManager",
  },
  ServiceCatalog: {
    name: "Service Catalog",
    color: AWS_COLORS.managementPink.main,
    borderColor: AWS_COLORS.managementPink.border,
    category: "management",
    abbreviation: "SC",
    iconFile: "AWSServiceCatalog",
  },

  // Analytics
  Kinesis: {
    name: "Kinesis",
    color: AWS_COLORS.purple.main,
    borderColor: AWS_COLORS.purple.border,
    category: "analytics",
    abbreviation: "KIN",
    iconFile: "AmazonKinesis",
  },
  Athena: {
    name: "Athena",
    color: AWS_COLORS.purple.main,
    borderColor: AWS_COLORS.purple.border,
    category: "analytics",
    abbreviation: "ATH",
    iconFile: "AmazonAthena",
  },
  Glue: {
    name: "Glue",
    color: AWS_COLORS.purple.main,
    borderColor: AWS_COLORS.purple.border,
    category: "analytics",
    abbreviation: "GLU",
    iconFile: "AWSGlue",
  },
  EMR: {
    name: "EMR",
    color: AWS_COLORS.purple.main,
    borderColor: AWS_COLORS.purple.border,
    category: "analytics",
    abbreviation: "EMR",
    iconFile: "AmazonEMR",
  },

  // Custom/Other
  Custom: {
    name: "Custom Resource",
    color: AWS_COLORS.gray.main,
    borderColor: AWS_COLORS.gray.border,
    category: "other",
    abbreviation: "CST",
  },
};

/**
 * Default service info for unknown services
 */
const DEFAULT_SERVICE_INFO: ServiceInfo = {
  name: "Unknown",
  color: AWS_COLORS.gray.main,
  borderColor: AWS_COLORS.gray.border,
  category: "other",
  abbreviation: "???",
};

// =============================================================================
// Public API
// =============================================================================

/**
 * Extracts the AWS service name from a CloudFormation resource type
 *
 * @param resourceType - The CloudFormation resource type (e.g., "AWS::Lambda::Function")
 * @returns The service name (e.g., "Lambda")
 *
 * @example
 * extractServiceName("AWS::Lambda::Function") // "Lambda"
 * extractServiceName("AWS::EC2::Instance") // "EC2"
 * extractServiceName("Custom::MyResource") // "Custom"
 */
export function extractServiceName(resourceType: string): string {
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
 * Extracts the resource name from a CloudFormation resource type
 *
 * @param resourceType - The CloudFormation resource type (e.g., "AWS::Lambda::Function")
 * @returns The resource name (e.g., "Function")
 *
 * @example
 * extractResourceName("AWS::Lambda::Function") // "Function"
 * extractResourceName("AWS::EC2::SecurityGroup") // "SecurityGroup"
 */
export function extractResourceName(resourceType: string): string {
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
 * Gets service information for a CloudFormation resource type
 *
 * @param resourceType - The CloudFormation resource type (e.g., "AWS::Lambda::Function")
 * @returns ServiceInfo object with name, color, category, and abbreviation
 *
 * @example
 * const info = getServiceInfo("AWS::Lambda::Function");
 * // { name: "Lambda", color: "#FF9900", category: "compute", abbreviation: "LMB" }
 */
export function getServiceInfo(resourceType: string): ServiceInfo {
  const serviceName = extractServiceName(resourceType);
  return SERVICE_DEFINITIONS[serviceName] ?? {
    ...DEFAULT_SERVICE_INFO,
    name: serviceName,
    abbreviation: serviceName.substring(0, 3).toUpperCase(),
  };
}

/**
 * Gets all available service definitions
 *
 * @returns Record of all service definitions
 */
export function getAllServiceDefinitions(): Record<string, ServiceInfo> {
  return { ...SERVICE_DEFINITIONS };
}

/**
 * Gets the AWS brand colors
 *
 * @returns Object containing AWS color palette
 */
export function getAWSColors(): typeof AWS_COLORS {
  return AWS_COLORS;
}

/**
 * Gets the icon URL for an AWS service
 *
 * @param resourceType - The CloudFormation resource type (e.g., "AWS::Lambda::Function")
 * @returns The URL to the SVG icon, or undefined if no icon is available
 *
 * @example
 * const iconUrl = getIconUrl("AWS::Lambda::Function");
 * // "/aws-icons/AWSLambda.svg"
 */
export function getIconUrl(resourceType: string): string | undefined {
  const serviceInfo = getServiceInfo(resourceType);
  if (serviceInfo.iconFile) {
    // Icons are copied to public/aws-icons during build
    return `/aws-icons/${serviceInfo.iconFile}.svg`;
  }
  return undefined;
}
