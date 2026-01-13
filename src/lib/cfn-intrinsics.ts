/**
 * CloudFormation Intrinsic Function Registry
 *
 * Complete registry of all CloudFormation intrinsic functions with metadata
 * for auto-completion, validation, and syntax highlighting.
 */

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Intrinsic function category
 */
export type IntrinsicCategory =
  | 'reference'
  | 'string'
  | 'list'
  | 'map'
  | 'condition'
  | 'transform'
  | 'utility'

/**
 * Intrinsic function metadata
 */
export interface IntrinsicFunctionInfo {
  /** Function name (e.g., "Ref", "Fn::GetAtt") */
  name: string
  /** Short name for YAML (e.g., "!Ref", "!GetAtt") */
  yamlTag?: string
  /** Category of the function */
  category: IntrinsicCategory
  /** Brief description */
  description: string
  /** Expected parameter type(s) */
  parameterType: string
  /** Usage example */
  example: string
  /** Documentation URL */
  docsUrl: string
}

// =============================================================================
// Intrinsic Function Registry
// =============================================================================

/**
 * Reference functions
 */
const REFERENCE_FUNCTIONS: IntrinsicFunctionInfo[] = [
  {
    name: 'Ref',
    yamlTag: '!Ref',
    category: 'reference',
    description: 'Returns the value of a parameter or resource',
    parameterType: 'string',
    example: '{ "Ref": "MyParameter" }',
    docsUrl:
      'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-ref.html',
  },
  {
    name: 'Fn::GetAtt',
    yamlTag: '!GetAtt',
    category: 'reference',
    description: 'Returns the value of an attribute from a resource',
    parameterType: '[string, string] | string',
    example: '{ "Fn::GetAtt": ["MyResource", "Arn"] }',
    docsUrl:
      'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html',
  },
  {
    name: 'Fn::ImportValue',
    yamlTag: '!ImportValue',
    category: 'reference',
    description: 'Returns the value of an output exported by another stack',
    parameterType: 'string | object',
    example: '{ "Fn::ImportValue": "SharedValueToImport" }',
    docsUrl:
      'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-importvalue.html',
  },
]

/**
 * String manipulation functions
 */
const STRING_FUNCTIONS: IntrinsicFunctionInfo[] = [
  {
    name: 'Fn::Sub',
    yamlTag: '!Sub',
    category: 'string',
    description: 'Substitutes variables in an input string with values',
    parameterType: 'string | [string, object]',
    example: '{ "Fn::Sub": "arn:aws:s3:::${BucketName}" }',
    docsUrl:
      'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-sub.html',
  },
  {
    name: 'Fn::Join',
    yamlTag: '!Join',
    category: 'string',
    description: 'Appends a set of values into a single value, separated by a delimiter',
    parameterType: '[string, array]',
    example: '{ "Fn::Join": ["-", ["a", "b", "c"]] }',
    docsUrl:
      'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-join.html',
  },
  {
    name: 'Fn::Split',
    yamlTag: '!Split',
    category: 'string',
    description: 'Splits a string into a list of string values',
    parameterType: '[string, string | object]',
    example: '{ "Fn::Split": ["|", "a|b|c"] }',
    docsUrl:
      'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-split.html',
  },
  {
    name: 'Fn::Base64',
    yamlTag: '!Base64',
    category: 'string',
    description: 'Returns the Base64 representation of the input string',
    parameterType: 'string | object',
    example: '{ "Fn::Base64": "AWS CloudFormation" }',
    docsUrl:
      'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-base64.html',
  },
]

/**
 * List manipulation functions
 */
const LIST_FUNCTIONS: IntrinsicFunctionInfo[] = [
  {
    name: 'Fn::Select',
    yamlTag: '!Select',
    category: 'list',
    description: 'Returns a single object from a list of objects by index',
    parameterType: '[number | string, array]',
    example: '{ "Fn::Select": [0, ["a", "b", "c"]] }',
    docsUrl:
      'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-select.html',
  },
  {
    name: 'Fn::GetAZs',
    yamlTag: '!GetAZs',
    category: 'list',
    description: 'Returns an array of Availability Zones for a region',
    parameterType: 'string | object',
    example: '{ "Fn::GetAZs": "" }',
    docsUrl:
      'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getavailabilityzones.html',
  },
  {
    name: 'Fn::Cidr',
    yamlTag: '!Cidr',
    category: 'list',
    description: 'Returns an array of CIDR address blocks',
    parameterType: '[string | object, number | string, number | string]',
    example: '{ "Fn::Cidr": ["10.0.0.0/16", 6, 8] }',
    docsUrl:
      'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-cidr.html',
  },
  {
    name: 'Fn::Length',
    yamlTag: '!Length',
    category: 'list',
    description: 'Returns the number of elements in an array',
    parameterType: 'array | object',
    example: '{ "Fn::Length": ["a", "b", "c"] }',
    docsUrl:
      'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-length.html',
  },
]

/**
 * Map/lookup functions
 */
const MAP_FUNCTIONS: IntrinsicFunctionInfo[] = [
  {
    name: 'Fn::FindInMap',
    yamlTag: '!FindInMap',
    category: 'map',
    description: 'Returns the value corresponding to keys in a two-level map',
    parameterType: '[string, string | object, string | object]',
    example: '{ "Fn::FindInMap": ["RegionMap", { "Ref": "AWS::Region" }, "AMI"] }',
    docsUrl:
      'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-findinmap.html',
  },
]

/**
 * Condition functions
 */
const CONDITION_FUNCTIONS: IntrinsicFunctionInfo[] = [
  {
    name: 'Fn::If',
    yamlTag: '!If',
    category: 'condition',
    description: 'Returns one value if condition is true, another if false',
    parameterType: '[string, any, any]',
    example: '{ "Fn::If": ["CreateProdResources", "m5.large", "t3.micro"] }',
    docsUrl:
      'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-conditions.html#intrinsic-function-reference-conditions-if',
  },
  {
    name: 'Fn::And',
    yamlTag: '!And',
    category: 'condition',
    description: 'Returns true if all conditions evaluate to true',
    parameterType: 'array',
    example:
      '{ "Fn::And": [{ "Condition": "IsProduction" }, { "Fn::Equals": ["us-east-1", { "Ref": "AWS::Region" }] }] }',
    docsUrl:
      'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-conditions.html#intrinsic-function-reference-conditions-and',
  },
  {
    name: 'Fn::Or',
    yamlTag: '!Or',
    category: 'condition',
    description: 'Returns true if any condition evaluates to true',
    parameterType: 'array',
    example: '{ "Fn::Or": [{ "Condition": "IsProduction" }, { "Condition": "IsStaging" }] }',
    docsUrl:
      'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-conditions.html#intrinsic-function-reference-conditions-or',
  },
  {
    name: 'Fn::Not',
    yamlTag: '!Not',
    category: 'condition',
    description: 'Returns true if condition evaluates to false',
    parameterType: 'array',
    example: '{ "Fn::Not": [{ "Condition": "IsProduction" }] }',
    docsUrl:
      'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-conditions.html#intrinsic-function-reference-conditions-not',
  },
  {
    name: 'Fn::Equals',
    yamlTag: '!Equals',
    category: 'condition',
    description: 'Compares if two values are equal',
    parameterType: '[any, any]',
    example: '{ "Fn::Equals": [{ "Ref": "Environment" }, "production"] }',
    docsUrl:
      'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-conditions.html#intrinsic-function-reference-conditions-equals',
  },
  {
    name: 'Condition',
    category: 'condition',
    description: 'References a condition defined in the Conditions section',
    parameterType: 'string',
    example: '{ "Condition": "CreateProdResources" }',
    docsUrl:
      'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-conditions.html',
  },
]

/**
 * Transform functions
 */
const TRANSFORM_FUNCTIONS: IntrinsicFunctionInfo[] = [
  {
    name: 'Fn::Transform',
    category: 'transform',
    description: 'Specifies a macro to perform custom processing on templates',
    parameterType: 'object',
    example:
      '{ "Fn::Transform": { "Name": "AWS::Include", "Parameters": { "Location": "s3://bucket/template.yaml" } } }',
    docsUrl:
      'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-transform.html',
  },
]

/**
 * Utility functions
 */
const UTILITY_FUNCTIONS: IntrinsicFunctionInfo[] = [
  {
    name: 'Fn::ToJsonString',
    yamlTag: '!ToJsonString',
    category: 'utility',
    description: 'Converts an object or array to its JSON string representation',
    parameterType: 'object | array',
    example: '{ "Fn::ToJsonString": { "key": "value" } }',
    docsUrl:
      'https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-tojsonstring.html',
  },
]

/**
 * All intrinsic functions
 */
export const ALL_INTRINSIC_FUNCTIONS: IntrinsicFunctionInfo[] = [
  ...REFERENCE_FUNCTIONS,
  ...STRING_FUNCTIONS,
  ...LIST_FUNCTIONS,
  ...MAP_FUNCTIONS,
  ...CONDITION_FUNCTIONS,
  ...TRANSFORM_FUNCTIONS,
  ...UTILITY_FUNCTIONS,
]

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Gets all intrinsic function names
 */
export function getAllIntrinsicNames(): string[] {
  return ALL_INTRINSIC_FUNCTIONS.map((fn) => fn.name)
}

/**
 * Gets all YAML tag names
 */
export function getAllYamlTags(): string[] {
  return ALL_INTRINSIC_FUNCTIONS.filter((fn) => fn.yamlTag).map((fn) => fn.yamlTag as string)
}

/**
 * Gets intrinsic function info by name
 */
export function getIntrinsicInfo(name: string): IntrinsicFunctionInfo | undefined {
  return ALL_INTRINSIC_FUNCTIONS.find((fn) => fn.name === name)
}

/**
 * Gets intrinsic function info by YAML tag
 */
export function getIntrinsicInfoByYamlTag(tag: string): IntrinsicFunctionInfo | undefined {
  return ALL_INTRINSIC_FUNCTIONS.find((fn) => fn.yamlTag === tag)
}

/**
 * Gets intrinsic functions by category
 */
export function getIntrinsicsByCategory(category: IntrinsicCategory): IntrinsicFunctionInfo[] {
  return ALL_INTRINSIC_FUNCTIONS.filter((fn) => fn.category === category)
}

/**
 * Checks if a string is a valid intrinsic function name
 */
export function isIntrinsicFunction(name: string): boolean {
  return getAllIntrinsicNames().includes(name)
}

/**
 * Checks if a string is a valid YAML tag
 */
export function isYamlTag(tag: string): boolean {
  return getAllYamlTags().includes(tag)
}

/**
 * Searches intrinsic functions by partial match
 */
export function searchIntrinsics(query: string): IntrinsicFunctionInfo[] {
  const lowerQuery = query.toLowerCase()
  return ALL_INTRINSIC_FUNCTIONS.filter(
    (fn) =>
      fn.name.toLowerCase().includes(lowerQuery) ||
      fn.description.toLowerCase().includes(lowerQuery) ||
      (fn.yamlTag && fn.yamlTag.toLowerCase().includes(lowerQuery))
  )
}

/**
 * Gets all categories
 */
export function getAllCategories(): IntrinsicCategory[] {
  return ['reference', 'string', 'list', 'map', 'condition', 'transform', 'utility']
}

/**
 * Checks if a value in a template is an intrinsic function
 */
export function isIntrinsicFunctionValue(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const keys = Object.keys(value)
  if (keys.length !== 1) {
    return false
  }

  return isIntrinsicFunction(keys[0])
}
