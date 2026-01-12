/**
 * CloudFormation Resource Type Definitions
 *
 * Comprehensive registry of AWS CloudFormation resource types organized by service.
 * Used for auto-completion, validation, and syntax highlighting.
 */

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * CloudFormation resource type metadata
 */
export interface ResourceTypeInfo {
  /** Full resource type (e.g., "AWS::Lambda::Function") */
  type: string
  /** Service name (e.g., "Lambda") */
  service: string
  /** Resource name (e.g., "Function") */
  resource: string
  /** Common properties for this resource type */
  commonProperties?: string[]
  /** Description of the resource */
  description?: string
}

/**
 * Service category for organizing resource types
 */
export interface ServiceCategory {
  /** Service name */
  name: string
  /** Display name */
  displayName: string
  /** Resource types in this service */
  types: ResourceTypeInfo[]
}

// =============================================================================
// Resource Type Registry
// =============================================================================

/**
 * Compute service resource types
 */
const COMPUTE_TYPES: ResourceTypeInfo[] = [
  {
    type: 'AWS::Lambda::Function',
    service: 'Lambda',
    resource: 'Function',
    commonProperties: ['FunctionName', 'Runtime', 'Handler', 'Code', 'Role'],
  },
  {
    type: 'AWS::Lambda::Version',
    service: 'Lambda',
    resource: 'Version',
    commonProperties: ['FunctionName'],
  },
  {
    type: 'AWS::Lambda::Alias',
    service: 'Lambda',
    resource: 'Alias',
    commonProperties: ['FunctionName', 'FunctionVersion', 'Name'],
  },
  {
    type: 'AWS::Lambda::EventSourceMapping',
    service: 'Lambda',
    resource: 'EventSourceMapping',
    commonProperties: ['FunctionName', 'EventSourceArn'],
  },
  {
    type: 'AWS::Lambda::Permission',
    service: 'Lambda',
    resource: 'Permission',
    commonProperties: ['FunctionName', 'Action', 'Principal'],
  },
  {
    type: 'AWS::Lambda::LayerVersion',
    service: 'Lambda',
    resource: 'LayerVersion',
    commonProperties: ['Content', 'LayerName'],
  },
  {
    type: 'AWS::EC2::Instance',
    service: 'EC2',
    resource: 'Instance',
    commonProperties: ['ImageId', 'InstanceType', 'KeyName'],
  },
  {
    type: 'AWS::EC2::LaunchTemplate',
    service: 'EC2',
    resource: 'LaunchTemplate',
    commonProperties: ['LaunchTemplateName', 'LaunchTemplateData'],
  },
  {
    type: 'AWS::AutoScaling::AutoScalingGroup',
    service: 'AutoScaling',
    resource: 'AutoScalingGroup',
    commonProperties: ['MinSize', 'MaxSize', 'DesiredCapacity'],
  },
  {
    type: 'AWS::AutoScaling::LaunchConfiguration',
    service: 'AutoScaling',
    resource: 'LaunchConfiguration',
    commonProperties: ['ImageId', 'InstanceType'],
  },
  {
    type: 'AWS::ECS::Cluster',
    service: 'ECS',
    resource: 'Cluster',
    commonProperties: ['ClusterName'],
  },
  {
    type: 'AWS::ECS::Service',
    service: 'ECS',
    resource: 'Service',
    commonProperties: ['ServiceName', 'TaskDefinition', 'Cluster'],
  },
  {
    type: 'AWS::ECS::TaskDefinition',
    service: 'ECS',
    resource: 'TaskDefinition',
    commonProperties: ['Family', 'ContainerDefinitions'],
  },
  {
    type: 'AWS::EKS::Cluster',
    service: 'EKS',
    resource: 'Cluster',
    commonProperties: ['Name', 'RoleArn', 'ResourcesVpcConfig'],
  },
  {
    type: 'AWS::EKS::Nodegroup',
    service: 'EKS',
    resource: 'Nodegroup',
    commonProperties: ['ClusterName', 'NodeRole', 'Subnets'],
  },
  {
    type: 'AWS::Batch::JobDefinition',
    service: 'Batch',
    resource: 'JobDefinition',
    commonProperties: ['Type', 'JobDefinitionName'],
  },
  {
    type: 'AWS::Batch::JobQueue',
    service: 'Batch',
    resource: 'JobQueue',
    commonProperties: ['JobQueueName', 'Priority', 'ComputeEnvironmentOrder'],
  },
  {
    type: 'AWS::Batch::ComputeEnvironment',
    service: 'Batch',
    resource: 'ComputeEnvironment',
    commonProperties: ['Type', 'ComputeEnvironmentName'],
  },
]

/**
 * Storage service resource types
 */
const STORAGE_TYPES: ResourceTypeInfo[] = [
  {
    type: 'AWS::S3::Bucket',
    service: 'S3',
    resource: 'Bucket',
    commonProperties: ['BucketName', 'AccessControl', 'VersioningConfiguration'],
  },
  {
    type: 'AWS::S3::BucketPolicy',
    service: 'S3',
    resource: 'BucketPolicy',
    commonProperties: ['Bucket', 'PolicyDocument'],
  },
  {
    type: 'AWS::EFS::FileSystem',
    service: 'EFS',
    resource: 'FileSystem',
    commonProperties: ['FileSystemTags', 'PerformanceMode'],
  },
  {
    type: 'AWS::EFS::MountTarget',
    service: 'EFS',
    resource: 'MountTarget',
    commonProperties: ['FileSystemId', 'SubnetId', 'SecurityGroups'],
  },
  {
    type: 'AWS::FSx::FileSystem',
    service: 'FSx',
    resource: 'FileSystem',
    commonProperties: ['FileSystemType', 'StorageCapacity', 'SubnetIds'],
  },
  {
    type: 'AWS::Backup::BackupPlan',
    service: 'Backup',
    resource: 'BackupPlan',
    commonProperties: ['BackupPlan'],
  },
  {
    type: 'AWS::Backup::BackupVault',
    service: 'Backup',
    resource: 'BackupVault',
    commonProperties: ['BackupVaultName'],
  },
]

/**
 * Database service resource types
 */
const DATABASE_TYPES: ResourceTypeInfo[] = [
  {
    type: 'AWS::DynamoDB::Table',
    service: 'DynamoDB',
    resource: 'Table',
    commonProperties: ['TableName', 'KeySchema', 'AttributeDefinitions'],
  },
  {
    type: 'AWS::DynamoDB::GlobalTable',
    service: 'DynamoDB',
    resource: 'GlobalTable',
    commonProperties: ['TableName', 'Replicas', 'AttributeDefinitions'],
  },
  {
    type: 'AWS::RDS::DBInstance',
    service: 'RDS',
    resource: 'DBInstance',
    commonProperties: ['DBInstanceIdentifier', 'Engine', 'DBInstanceClass'],
  },
  {
    type: 'AWS::RDS::DBCluster',
    service: 'RDS',
    resource: 'DBCluster',
    commonProperties: ['DBClusterIdentifier', 'Engine', 'MasterUsername'],
  },
  {
    type: 'AWS::RDS::DBSubnetGroup',
    service: 'RDS',
    resource: 'DBSubnetGroup',
    commonProperties: ['DBSubnetGroupDescription', 'SubnetIds'],
  },
  {
    type: 'AWS::RDS::DBParameterGroup',
    service: 'RDS',
    resource: 'DBParameterGroup',
    commonProperties: ['Description', 'Family'],
  },
  {
    type: 'AWS::ElastiCache::CacheCluster',
    service: 'ElastiCache',
    resource: 'CacheCluster',
    commonProperties: ['CacheNodeType', 'Engine', 'NumCacheNodes'],
  },
  {
    type: 'AWS::ElastiCache::ReplicationGroup',
    service: 'ElastiCache',
    resource: 'ReplicationGroup',
    commonProperties: ['ReplicationGroupDescription', 'Engine'],
  },
  {
    type: 'AWS::Neptune::DBCluster',
    service: 'Neptune',
    resource: 'DBCluster',
    commonProperties: ['DBClusterIdentifier'],
  },
  {
    type: 'AWS::Redshift::Cluster',
    service: 'Redshift',
    resource: 'Cluster',
    commonProperties: ['ClusterIdentifier', 'NodeType', 'MasterUsername'],
  },
  {
    type: 'AWS::DocumentDB::DBCluster',
    service: 'DocumentDB',
    resource: 'DBCluster',
    commonProperties: ['DBClusterIdentifier', 'MasterUsername'],
  },
]

/**
 * Networking service resource types
 */
const NETWORKING_TYPES: ResourceTypeInfo[] = [
  {
    type: 'AWS::EC2::VPC',
    service: 'EC2',
    resource: 'VPC',
    commonProperties: ['CidrBlock', 'EnableDnsHostnames', 'EnableDnsSupport'],
  },
  {
    type: 'AWS::EC2::Subnet',
    service: 'EC2',
    resource: 'Subnet',
    commonProperties: ['VpcId', 'CidrBlock', 'AvailabilityZone'],
  },
  {
    type: 'AWS::EC2::InternetGateway',
    service: 'EC2',
    resource: 'InternetGateway',
    commonProperties: [],
  },
  {
    type: 'AWS::EC2::VPCGatewayAttachment',
    service: 'EC2',
    resource: 'VPCGatewayAttachment',
    commonProperties: ['VpcId', 'InternetGatewayId'],
  },
  {
    type: 'AWS::EC2::RouteTable',
    service: 'EC2',
    resource: 'RouteTable',
    commonProperties: ['VpcId'],
  },
  {
    type: 'AWS::EC2::Route',
    service: 'EC2',
    resource: 'Route',
    commonProperties: ['RouteTableId', 'DestinationCidrBlock'],
  },
  {
    type: 'AWS::EC2::SubnetRouteTableAssociation',
    service: 'EC2',
    resource: 'SubnetRouteTableAssociation',
    commonProperties: ['SubnetId', 'RouteTableId'],
  },
  {
    type: 'AWS::EC2::SecurityGroup',
    service: 'EC2',
    resource: 'SecurityGroup',
    commonProperties: ['GroupDescription', 'VpcId', 'SecurityGroupIngress'],
  },
  {
    type: 'AWS::EC2::SecurityGroupIngress',
    service: 'EC2',
    resource: 'SecurityGroupIngress',
    commonProperties: ['GroupId', 'IpProtocol'],
  },
  {
    type: 'AWS::EC2::SecurityGroupEgress',
    service: 'EC2',
    resource: 'SecurityGroupEgress',
    commonProperties: ['GroupId', 'IpProtocol'],
  },
  {
    type: 'AWS::EC2::NatGateway',
    service: 'EC2',
    resource: 'NatGateway',
    commonProperties: ['SubnetId', 'AllocationId'],
  },
  { type: 'AWS::EC2::EIP', service: 'EC2', resource: 'EIP', commonProperties: ['Domain'] },
  {
    type: 'AWS::EC2::VPCEndpoint',
    service: 'EC2',
    resource: 'VPCEndpoint',
    commonProperties: ['VpcId', 'ServiceName'],
  },
  {
    type: 'AWS::ElasticLoadBalancingV2::LoadBalancer',
    service: 'ElasticLoadBalancingV2',
    resource: 'LoadBalancer',
    commonProperties: ['Name', 'Subnets', 'Type'],
  },
  {
    type: 'AWS::ElasticLoadBalancingV2::TargetGroup',
    service: 'ElasticLoadBalancingV2',
    resource: 'TargetGroup',
    commonProperties: ['Name', 'Port', 'Protocol', 'VpcId'],
  },
  {
    type: 'AWS::ElasticLoadBalancingV2::Listener',
    service: 'ElasticLoadBalancingV2',
    resource: 'Listener',
    commonProperties: ['LoadBalancerArn', 'Port', 'Protocol'],
  },
  {
    type: 'AWS::CloudFront::Distribution',
    service: 'CloudFront',
    resource: 'Distribution',
    commonProperties: ['DistributionConfig'],
  },
  {
    type: 'AWS::Route53::HostedZone',
    service: 'Route53',
    resource: 'HostedZone',
    commonProperties: ['Name'],
  },
  {
    type: 'AWS::Route53::RecordSet',
    service: 'Route53',
    resource: 'RecordSet',
    commonProperties: ['Name', 'Type', 'HostedZoneId'],
  },
]

/**
 * Security & Identity service resource types
 */
const SECURITY_TYPES: ResourceTypeInfo[] = [
  {
    type: 'AWS::IAM::Role',
    service: 'IAM',
    resource: 'Role',
    commonProperties: ['RoleName', 'AssumeRolePolicyDocument', 'Policies'],
  },
  {
    type: 'AWS::IAM::Policy',
    service: 'IAM',
    resource: 'Policy',
    commonProperties: ['PolicyName', 'PolicyDocument'],
  },
  {
    type: 'AWS::IAM::User',
    service: 'IAM',
    resource: 'User',
    commonProperties: ['UserName', 'Policies'],
  },
  {
    type: 'AWS::IAM::Group',
    service: 'IAM',
    resource: 'Group',
    commonProperties: ['GroupName', 'Policies'],
  },
  {
    type: 'AWS::IAM::InstanceProfile',
    service: 'IAM',
    resource: 'InstanceProfile',
    commonProperties: ['Roles'],
  },
  {
    type: 'AWS::IAM::ManagedPolicy',
    service: 'IAM',
    resource: 'ManagedPolicy',
    commonProperties: ['ManagedPolicyName', 'PolicyDocument'],
  },
  {
    type: 'AWS::KMS::Key',
    service: 'KMS',
    resource: 'Key',
    commonProperties: ['KeyPolicy', 'Description'],
  },
  {
    type: 'AWS::KMS::Alias',
    service: 'KMS',
    resource: 'Alias',
    commonProperties: ['AliasName', 'TargetKeyId'],
  },
  {
    type: 'AWS::SecretsManager::Secret',
    service: 'SecretsManager',
    resource: 'Secret',
    commonProperties: ['Name', 'SecretString'],
  },
  {
    type: 'AWS::SecretsManager::SecretTargetAttachment',
    service: 'SecretsManager',
    resource: 'SecretTargetAttachment',
    commonProperties: ['SecretId', 'TargetId', 'TargetType'],
  },
  {
    type: 'AWS::Cognito::UserPool',
    service: 'Cognito',
    resource: 'UserPool',
    commonProperties: ['UserPoolName', 'Policies'],
  },
  {
    type: 'AWS::Cognito::UserPoolClient',
    service: 'Cognito',
    resource: 'UserPoolClient',
    commonProperties: ['UserPoolId', 'ClientName'],
  },
  {
    type: 'AWS::Cognito::IdentityPool',
    service: 'Cognito',
    resource: 'IdentityPool',
    commonProperties: ['IdentityPoolName', 'AllowUnauthenticatedIdentities'],
  },
]

/**
 * Application Integration service resource types
 */
const APP_INTEGRATION_TYPES: ResourceTypeInfo[] = [
  {
    type: 'AWS::SNS::Topic',
    service: 'SNS',
    resource: 'Topic',
    commonProperties: ['TopicName', 'DisplayName', 'Subscription'],
  },
  {
    type: 'AWS::SNS::Subscription',
    service: 'SNS',
    resource: 'Subscription',
    commonProperties: ['TopicArn', 'Protocol', 'Endpoint'],
  },
  {
    type: 'AWS::SQS::Queue',
    service: 'SQS',
    resource: 'Queue',
    commonProperties: ['QueueName', 'VisibilityTimeout', 'MessageRetentionPeriod'],
  },
  {
    type: 'AWS::SQS::QueuePolicy',
    service: 'SQS',
    resource: 'QueuePolicy',
    commonProperties: ['Queues', 'PolicyDocument'],
  },
  {
    type: 'AWS::ApiGateway::RestApi',
    service: 'ApiGateway',
    resource: 'RestApi',
    commonProperties: ['Name', 'Description'],
  },
  {
    type: 'AWS::ApiGateway::Resource',
    service: 'ApiGateway',
    resource: 'Resource',
    commonProperties: ['RestApiId', 'ParentId', 'PathPart'],
  },
  {
    type: 'AWS::ApiGateway::Method',
    service: 'ApiGateway',
    resource: 'Method',
    commonProperties: ['RestApiId', 'ResourceId', 'HttpMethod'],
  },
  {
    type: 'AWS::ApiGateway::Deployment',
    service: 'ApiGateway',
    resource: 'Deployment',
    commonProperties: ['RestApiId', 'StageName'],
  },
  {
    type: 'AWS::ApiGateway::Stage',
    service: 'ApiGateway',
    resource: 'Stage',
    commonProperties: ['RestApiId', 'DeploymentId', 'StageName'],
  },
  {
    type: 'AWS::ApiGatewayV2::Api',
    service: 'ApiGatewayV2',
    resource: 'Api',
    commonProperties: ['Name', 'ProtocolType'],
  },
  {
    type: 'AWS::ApiGatewayV2::Stage',
    service: 'ApiGatewayV2',
    resource: 'Stage',
    commonProperties: ['ApiId', 'StageName'],
  },
  {
    type: 'AWS::ApiGatewayV2::Integration',
    service: 'ApiGatewayV2',
    resource: 'Integration',
    commonProperties: ['ApiId', 'IntegrationType'],
  },
  {
    type: 'AWS::EventBridge::Rule',
    service: 'EventBridge',
    resource: 'Rule',
    commonProperties: ['Name', 'EventPattern', 'Targets'],
  },
  {
    type: 'AWS::Events::Rule',
    service: 'Events',
    resource: 'Rule',
    commonProperties: ['Name', 'EventPattern', 'Targets'],
  },
  {
    type: 'AWS::StepFunctions::StateMachine',
    service: 'StepFunctions',
    resource: 'StateMachine',
    commonProperties: ['StateMachineName', 'DefinitionString', 'RoleArn'],
  },
  {
    type: 'AWS::AppSync::GraphQLApi',
    service: 'AppSync',
    resource: 'GraphQLApi',
    commonProperties: ['Name', 'AuthenticationType'],
  },
  {
    type: 'AWS::AppSync::DataSource',
    service: 'AppSync',
    resource: 'DataSource',
    commonProperties: ['ApiId', 'Name', 'Type'],
  },
]

/**
 * Analytics service resource types
 */
const ANALYTICS_TYPES: ResourceTypeInfo[] = [
  {
    type: 'AWS::Kinesis::Stream',
    service: 'Kinesis',
    resource: 'Stream',
    commonProperties: ['Name', 'ShardCount'],
  },
  {
    type: 'AWS::KinesisFirehose::DeliveryStream',
    service: 'KinesisFirehose',
    resource: 'DeliveryStream',
    commonProperties: ['DeliveryStreamName', 'DeliveryStreamType'],
  },
  {
    type: 'AWS::Glue::Database',
    service: 'Glue',
    resource: 'Database',
    commonProperties: ['CatalogId', 'DatabaseInput'],
  },
  {
    type: 'AWS::Glue::Table',
    service: 'Glue',
    resource: 'Table',
    commonProperties: ['CatalogId', 'DatabaseName', 'TableInput'],
  },
  {
    type: 'AWS::Glue::Crawler',
    service: 'Glue',
    resource: 'Crawler',
    commonProperties: ['Name', 'Role', 'DatabaseName', 'Targets'],
  },
  {
    type: 'AWS::Athena::WorkGroup',
    service: 'Athena',
    resource: 'WorkGroup',
    commonProperties: ['Name', 'WorkGroupConfiguration'],
  },
  {
    type: 'AWS::Athena::NamedQuery',
    service: 'Athena',
    resource: 'NamedQuery',
    commonProperties: ['Database', 'QueryString'],
  },
]

/**
 * Management & Governance service resource types
 */
const MANAGEMENT_TYPES: ResourceTypeInfo[] = [
  {
    type: 'AWS::CloudWatch::Alarm',
    service: 'CloudWatch',
    resource: 'Alarm',
    commonProperties: ['AlarmName', 'MetricName', 'Namespace', 'Threshold'],
  },
  {
    type: 'AWS::CloudWatch::Dashboard',
    service: 'CloudWatch',
    resource: 'Dashboard',
    commonProperties: ['DashboardName', 'DashboardBody'],
  },
  {
    type: 'AWS::Logs::LogGroup',
    service: 'Logs',
    resource: 'LogGroup',
    commonProperties: ['LogGroupName', 'RetentionInDays'],
  },
  {
    type: 'AWS::Logs::LogStream',
    service: 'Logs',
    resource: 'LogStream',
    commonProperties: ['LogGroupName', 'LogStreamName'],
  },
  {
    type: 'AWS::CloudFormation::Stack',
    service: 'CloudFormation',
    resource: 'Stack',
    commonProperties: ['TemplateURL', 'Parameters'],
  },
  {
    type: 'AWS::CloudFormation::WaitCondition',
    service: 'CloudFormation',
    resource: 'WaitCondition',
    commonProperties: ['Handle', 'Timeout'],
  },
  {
    type: 'AWS::CloudFormation::WaitConditionHandle',
    service: 'CloudFormation',
    resource: 'WaitConditionHandle',
    commonProperties: [],
  },
  {
    type: 'AWS::SSM::Parameter',
    service: 'SSM',
    resource: 'Parameter',
    commonProperties: ['Name', 'Type', 'Value'],
  },
  {
    type: 'AWS::SSM::Document',
    service: 'SSM',
    resource: 'Document',
    commonProperties: ['Content', 'DocumentType'],
  },
]

/**
 * All service categories
 */
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { name: 'compute', displayName: 'Compute', types: COMPUTE_TYPES },
  { name: 'storage', displayName: 'Storage', types: STORAGE_TYPES },
  { name: 'database', displayName: 'Database', types: DATABASE_TYPES },
  { name: 'networking', displayName: 'Networking & Content Delivery', types: NETWORKING_TYPES },
  { name: 'security', displayName: 'Security, Identity & Compliance', types: SECURITY_TYPES },
  { name: 'integration', displayName: 'Application Integration', types: APP_INTEGRATION_TYPES },
  { name: 'analytics', displayName: 'Analytics', types: ANALYTICS_TYPES },
  { name: 'management', displayName: 'Management & Governance', types: MANAGEMENT_TYPES },
]

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Gets all resource types as a flat array
 */
export function getAllResourceTypes(): ResourceTypeInfo[] {
  return SERVICE_CATEGORIES.flatMap((category) => category.types)
}

/**
 * Gets all resource type strings
 */
export function getAllResourceTypeStrings(): string[] {
  return getAllResourceTypes().map((type) => type.type)
}

/**
 * Gets resource types for a specific service
 */
export function getResourceTypesByService(serviceName: string): ResourceTypeInfo[] {
  return getAllResourceTypes().filter((type) => type.service === serviceName)
}

/**
 * Gets resource type info by type string
 */
export function getResourceTypeInfo(typeString: string): ResourceTypeInfo | undefined {
  return getAllResourceTypes().find((type) => type.type === typeString)
}

/**
 * Checks if a string is a valid CloudFormation resource type
 */
export function isValidResourceType(typeString: string): boolean {
  return getAllResourceTypeStrings().includes(typeString)
}

/**
 * Gets all unique service names
 */
export function getAllServices(): string[] {
  const services = new Set<string>()
  getAllResourceTypes().forEach((type) => services.add(type.service))
  return Array.from(services).sort()
}

/**
 * Searches resource types by partial match
 */
export function searchResourceTypes(query: string): ResourceTypeInfo[] {
  const lowerQuery = query.toLowerCase()
  return getAllResourceTypes().filter(
    (type) =>
      type.type.toLowerCase().includes(lowerQuery) ||
      type.service.toLowerCase().includes(lowerQuery) ||
      type.resource.toLowerCase().includes(lowerQuery)
  )
}
