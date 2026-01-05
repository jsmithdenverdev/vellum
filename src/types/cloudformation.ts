/**
 * CloudFormation Template Type Definitions
 *
 * Comprehensive type definitions for AWS CloudFormation templates,
 * including intrinsic functions and all major template sections.
 */

// =============================================================================
// Intrinsic Functions
// =============================================================================

/**
 * Ref intrinsic function - references a parameter or resource
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-ref.html
 */
export interface RefFunction {
  Ref: string;
}

/**
 * Fn::GetAtt intrinsic function - returns attribute values
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html
 */
export interface GetAttFunction {
  "Fn::GetAtt": [string, string] | string;
}

/**
 * Fn::Sub intrinsic function - substitutes variables in a string
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-sub.html
 */
export interface SubFunction {
  "Fn::Sub":
    | string
    | [string, Record<string, CfnValue>];
}

/**
 * Fn::Join intrinsic function - joins values with a delimiter
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-join.html
 */
export interface JoinFunction {
  "Fn::Join": [string, CfnValue[]];
}

/**
 * Fn::Select intrinsic function - selects a value from a list
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-select.html
 */
export interface SelectFunction {
  "Fn::Select": [number | string, CfnValue[]];
}

/**
 * Fn::Split intrinsic function - splits a string into a list
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-split.html
 */
export interface SplitFunction {
  "Fn::Split": [string, CfnValue];
}

/**
 * Fn::Base64 intrinsic function - encodes to Base64
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-base64.html
 */
export interface Base64Function {
  "Fn::Base64": CfnValue;
}

/**
 * Fn::Cidr intrinsic function - returns CIDR address blocks
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-cidr.html
 */
export interface CidrFunction {
  "Fn::Cidr": [CfnValue, number | string, number | string];
}

/**
 * Fn::FindInMap intrinsic function - returns a value from a map
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-findinmap.html
 */
export interface FindInMapFunction {
  "Fn::FindInMap": [string, CfnValue, CfnValue];
}

/**
 * Fn::GetAZs intrinsic function - returns availability zones
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getavailabilityzones.html
 */
export interface GetAZsFunction {
  "Fn::GetAZs": CfnValue;
}

/**
 * Fn::ImportValue intrinsic function - imports an exported value
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-importvalue.html
 */
export interface ImportValueFunction {
  "Fn::ImportValue": CfnValue;
}

/**
 * Fn::If intrinsic function - conditional value
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-conditions.html#intrinsic-function-reference-conditions-if
 */
export interface IfFunction {
  "Fn::If": [string, CfnValue, CfnValue];
}

/**
 * Fn::Not intrinsic function - logical NOT
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-conditions.html#intrinsic-function-reference-conditions-not
 */
export interface NotFunction {
  "Fn::Not": [CfnConditionValue];
}

/**
 * Fn::And intrinsic function - logical AND
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-conditions.html#intrinsic-function-reference-conditions-and
 */
export interface AndFunction {
  "Fn::And": CfnConditionValue[];
}

/**
 * Fn::Or intrinsic function - logical OR
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-conditions.html#intrinsic-function-reference-conditions-or
 */
export interface OrFunction {
  "Fn::Or": CfnConditionValue[];
}

/**
 * Fn::Equals intrinsic function - equality comparison
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-conditions.html#intrinsic-function-reference-conditions-equals
 */
export interface EqualsFunction {
  "Fn::Equals": [CfnValue, CfnValue];
}

/**
 * Condition intrinsic function - references a condition
 */
export interface ConditionFunction {
  Condition: string;
}

/**
 * Fn::Transform intrinsic function - specifies a macro to perform custom processing
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-transform.html
 */
export interface TransformFunction {
  "Fn::Transform": {
    Name: string;
    Parameters?: Record<string, CfnValue>;
  };
}

/**
 * Fn::Length intrinsic function - returns the length of an array
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-length.html
 */
export interface LengthFunction {
  "Fn::Length": CfnValue;
}

/**
 * Fn::ToJsonString intrinsic function - converts object to JSON string
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-tojsonstring.html
 */
export interface ToJsonStringFunction {
  "Fn::ToJsonString": CfnValue;
}

/**
 * Union type for all intrinsic functions
 */
export type CfnIntrinsicFunction =
  | RefFunction
  | GetAttFunction
  | SubFunction
  | JoinFunction
  | SelectFunction
  | SplitFunction
  | Base64Function
  | CidrFunction
  | FindInMapFunction
  | GetAZsFunction
  | ImportValueFunction
  | IfFunction
  | NotFunction
  | AndFunction
  | OrFunction
  | EqualsFunction
  | ConditionFunction
  | TransformFunction
  | LengthFunction
  | ToJsonStringFunction;

/**
 * Condition-specific intrinsic functions
 */
export type CfnConditionValue =
  | ConditionFunction
  | EqualsFunction
  | AndFunction
  | OrFunction
  | NotFunction
  | RefFunction;

// =============================================================================
// Value Types
// =============================================================================

/**
 * Primitive values that can appear in CloudFormation templates
 */
export type CfnPrimitive = string | number | boolean | null;

/**
 * Recursive type for CloudFormation values that can contain intrinsic functions
 */
export type CfnValue =
  | CfnPrimitive
  | CfnIntrinsicFunction
  | CfnValue[]
  | { [key: string]: CfnValue };

// =============================================================================
// Parameters
// =============================================================================

/**
 * Valid CloudFormation parameter types
 */
export type CfnParameterType =
  | "String"
  | "Number"
  | "List<Number>"
  | "CommaDelimitedList"
  | "AWS::SSM::Parameter::Name"
  | "AWS::SSM::Parameter::Value<String>"
  | "AWS::SSM::Parameter::Value<List<String>>"
  | "AWS::SSM::Parameter::Value<CommaDelimitedList>"
  | `AWS::SSM::Parameter::Value<${string}>`
  | `AWS::EC2::AvailabilityZone::Name`
  | `AWS::EC2::Image::Id`
  | `AWS::EC2::Instance::Id`
  | `AWS::EC2::KeyPair::KeyName`
  | `AWS::EC2::SecurityGroup::GroupName`
  | `AWS::EC2::SecurityGroup::Id`
  | `AWS::EC2::Subnet::Id`
  | `AWS::EC2::Volume::Id`
  | `AWS::EC2::VPC::Id`
  | `AWS::Route53::HostedZone::Id`
  | `List<AWS::EC2::AvailabilityZone::Name>`
  | `List<AWS::EC2::Image::Id>`
  | `List<AWS::EC2::Instance::Id>`
  | `List<AWS::EC2::SecurityGroup::GroupName>`
  | `List<AWS::EC2::SecurityGroup::Id>`
  | `List<AWS::EC2::Subnet::Id>`
  | `List<AWS::EC2::Volume::Id>`
  | `List<AWS::EC2::VPC::Id>`
  | `List<AWS::Route53::HostedZone::Id>`;

/**
 * CloudFormation parameter definition
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/parameters-section-structure.html
 */
export interface CfnParameter {
  Type: CfnParameterType;
  Default?: string | number | string[];
  AllowedPattern?: string;
  AllowedValues?: (string | number)[];
  ConstraintDescription?: string;
  Description?: string;
  MaxLength?: number;
  MaxValue?: number;
  MinLength?: number;
  MinValue?: number;
  NoEcho?: boolean;
}

// =============================================================================
// Resources
// =============================================================================

/**
 * Resource attribute for creation policy
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-attribute-creationpolicy.html
 */
export interface CfnCreationPolicy {
  AutoScalingCreationPolicy?: {
    MinSuccessfulInstancesPercent?: number;
  };
  ResourceSignal?: {
    Count?: number;
    Timeout?: string;
  };
}

/**
 * Resource attribute for update policy
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-attribute-updatepolicy.html
 */
export interface CfnUpdatePolicy {
  AutoScalingReplacingUpdate?: {
    WillReplace?: boolean;
  };
  AutoScalingRollingUpdate?: {
    MaxBatchSize?: number;
    MinInstancesInService?: number;
    MinSuccessfulInstancesPercent?: number;
    PauseTime?: string;
    SuspendProcesses?: string[];
    WaitOnResourceSignals?: boolean;
  };
  AutoScalingScheduledAction?: {
    IgnoreUnmodifiedGroupSizeProperties?: boolean;
  };
  EnableVersionUpgrade?: boolean;
  UseOnlineResharding?: boolean;
}

/**
 * Resource deletion policy
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-attribute-deletionpolicy.html
 */
export type CfnDeletionPolicy = "Delete" | "Retain" | "Snapshot" | "RetainExceptOnCreate";

/**
 * Resource update replace policy
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-attribute-updatereplacepolicy.html
 */
export type CfnUpdateReplacePolicy = "Delete" | "Retain" | "Snapshot";

/**
 * CloudFormation resource definition
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/resources-section-structure.html
 */
export interface CfnResource {
  /** The AWS resource type (e.g., "AWS::EC2::Instance") */
  Type: string;
  /** Resource-specific properties */
  Properties?: Record<string, CfnValue>;
  /** Condition that must be true for resource creation */
  Condition?: string;
  /** Explicit dependencies on other resources */
  DependsOn?: string | string[];
  /** Metadata associated with the resource */
  Metadata?: Record<string, CfnValue>;
  /** Creation policy for resources that support signals */
  CreationPolicy?: CfnCreationPolicy;
  /** Update policy for Auto Scaling groups and other resources */
  UpdatePolicy?: CfnUpdatePolicy;
  /** What happens when the resource is deleted */
  DeletionPolicy?: CfnDeletionPolicy;
  /** What happens when the resource is replaced during an update */
  UpdateReplacePolicy?: CfnUpdateReplacePolicy;
}

// =============================================================================
// Outputs
// =============================================================================

/**
 * CloudFormation output definition
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/outputs-section-structure.html
 */
export interface CfnOutput {
  /** The output value */
  Value: CfnValue;
  /** Description of the output */
  Description?: string;
  /** Condition that must be true for the output to be created */
  Condition?: string;
  /** Export configuration for cross-stack references */
  Export?: {
    Name: CfnValue;
  };
}

// =============================================================================
// Mappings
// =============================================================================

/**
 * CloudFormation mapping definition
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/mappings-section-structure.html
 */
export type CfnMapping = Record<string, Record<string, CfnPrimitive | CfnPrimitive[]>>;

// =============================================================================
// Conditions
// =============================================================================

/**
 * CloudFormation condition definition
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/conditions-section-structure.html
 */
export type CfnCondition = CfnConditionValue;

// =============================================================================
// Transform
// =============================================================================

/**
 * CloudFormation transform (macros)
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/transform-section-structure.html
 */
export type CfnTransform = string | string[];

// =============================================================================
// Metadata
// =============================================================================

/**
 * CloudFormation template metadata
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/metadata-section-structure.html
 */
export type CfnTemplateMetadata = Record<string, CfnValue>;

// =============================================================================
// Rules
// =============================================================================

/**
 * CloudFormation rule assertion
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/rules-section-structure.html
 */
export interface CfnRuleAssertion {
  Assert: CfnConditionValue;
  AssertDescription?: string;
}

/**
 * CloudFormation rule definition
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/rules-section-structure.html
 */
export interface CfnRule {
  RuleCondition?: CfnConditionValue;
  Assertions: CfnRuleAssertion[];
}

// =============================================================================
// Template
// =============================================================================

/**
 * Valid CloudFormation template format versions
 */
export type CfnTemplateFormatVersion = "2010-09-09";

/**
 * Complete CloudFormation template structure
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-anatomy.html
 */
export interface CloudFormationTemplate {
  /** Template format version (currently only "2010-09-09" is valid) */
  AWSTemplateFormatVersion?: CfnTemplateFormatVersion;
  /** Description of the template */
  Description?: string;
  /** Template metadata */
  Metadata?: CfnTemplateMetadata;
  /** Input parameters for the template */
  Parameters?: Record<string, CfnParameter>;
  /** Rules for parameter validation */
  Rules?: Record<string, CfnRule>;
  /** Mappings for conditional values */
  Mappings?: Record<string, CfnMapping>;
  /** Conditions for conditional resource creation */
  Conditions?: Record<string, CfnCondition>;
  /** Transform declarations (macros) */
  Transform?: CfnTransform;
  /** Resources to create (required) */
  Resources: Record<string, CfnResource>;
  /** Stack outputs */
  Outputs?: Record<string, CfnOutput>;
}

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard to check if a value is a Ref intrinsic function
 */
export function isRef(value: CfnValue): value is RefFunction {
  return typeof value === "object" && value !== null && "Ref" in value;
}

/**
 * Type guard to check if a value is a Fn::GetAtt intrinsic function
 */
export function isGetAtt(value: CfnValue): value is GetAttFunction {
  return typeof value === "object" && value !== null && "Fn::GetAtt" in value;
}

/**
 * Type guard to check if a value is a Fn::Sub intrinsic function
 */
export function isSub(value: CfnValue): value is SubFunction {
  return typeof value === "object" && value !== null && "Fn::Sub" in value;
}

/**
 * Type guard to check if a value is a Fn::Join intrinsic function
 */
export function isJoin(value: CfnValue): value is JoinFunction {
  return typeof value === "object" && value !== null && "Fn::Join" in value;
}

/**
 * Type guard to check if a value is a Fn::If intrinsic function
 */
export function isIf(value: CfnValue): value is IfFunction {
  return typeof value === "object" && value !== null && "Fn::If" in value;
}

/**
 * Type guard to check if a value is any CloudFormation intrinsic function
 */
export function isIntrinsicFunction(value: CfnValue): value is CfnIntrinsicFunction {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const intrinsicKeys = [
    "Ref",
    "Fn::GetAtt",
    "Fn::Sub",
    "Fn::Join",
    "Fn::Select",
    "Fn::Split",
    "Fn::Base64",
    "Fn::Cidr",
    "Fn::FindInMap",
    "Fn::GetAZs",
    "Fn::ImportValue",
    "Fn::If",
    "Fn::Not",
    "Fn::And",
    "Fn::Or",
    "Fn::Equals",
    "Condition",
    "Fn::Transform",
    "Fn::Length",
    "Fn::ToJsonString",
  ];

  return intrinsicKeys.some((key) => key in value);
}
