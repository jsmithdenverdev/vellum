/**
 * CloudFormation Template Parser
 *
 * Parses JSON CloudFormation templates into typed structures with
 * comprehensive validation and error handling.
 */

import type { CloudFormationTemplate, CfnResource } from "../types/cloudformation";

// =============================================================================
// Result Types
// =============================================================================

/**
 * Successful parse result containing the validated template
 */
export interface ParseSuccess {
  success: true;
  template: CloudFormationTemplate;
}

/**
 * Failed parse result containing the error message
 */
export interface ParseFailure {
  success: false;
  error: string;
}

/**
 * Discriminated union for parse results
 */
export type ParseResult = ParseSuccess | ParseFailure;

// =============================================================================
// Validation
// =============================================================================

/**
 * Known top-level CloudFormation template keys
 */
const VALID_TEMPLATE_KEYS = new Set([
  "AWSTemplateFormatVersion",
  "Description",
  "Metadata",
  "Parameters",
  "Rules",
  "Mappings",
  "Conditions",
  "Transform",
  "Resources",
  "Outputs",
]);

/**
 * Validates that the parsed object is a plain object (not an array or null)
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Validates the AWSTemplateFormatVersion field
 */
function validateTemplateVersion(version: unknown): string | null {
  if (version === undefined) {
    return null;
  }

  if (version !== "2010-09-09") {
    return `Invalid AWSTemplateFormatVersion: "${String(version)}". Only "2010-09-09" is supported.`;
  }

  return null;
}

/**
 * Validates the Description field
 */
function validateDescription(description: unknown): string | null {
  if (description === undefined) {
    return null;
  }

  if (typeof description !== "string") {
    return `Description must be a string, got ${typeof description}.`;
  }

  if (description.length > 1024) {
    return `Description exceeds maximum length of 1024 characters (got ${description.length}).`;
  }

  return null;
}

/**
 * Validates an individual resource definition
 */
function validateResource(
  logicalId: string,
  resource: unknown
): string | null {
  if (!isPlainObject(resource)) {
    return `Resource "${logicalId}" must be an object.`;
  }

  if (!("Type" in resource)) {
    return `Resource "${logicalId}" is missing required "Type" property.`;
  }

  if (typeof resource.Type !== "string") {
    return `Resource "${logicalId}" has invalid Type: must be a string.`;
  }

  if (resource.Type.length === 0) {
    return `Resource "${logicalId}" has empty Type.`;
  }

  // Validate DependsOn if present
  if ("DependsOn" in resource && resource.DependsOn !== undefined) {
    const dependsOn = resource.DependsOn;
    if (
      typeof dependsOn !== "string" &&
      !(Array.isArray(dependsOn) && dependsOn.every((d) => typeof d === "string"))
    ) {
      return `Resource "${logicalId}" has invalid DependsOn: must be a string or array of strings.`;
    }
  }

  // Validate Properties if present
  if ("Properties" in resource && resource.Properties !== undefined) {
    if (!isPlainObject(resource.Properties)) {
      return `Resource "${logicalId}" has invalid Properties: must be an object.`;
    }
  }

  // Validate Condition if present
  if ("Condition" in resource && resource.Condition !== undefined) {
    if (typeof resource.Condition !== "string") {
      return `Resource "${logicalId}" has invalid Condition: must be a string.`;
    }
  }

  return null;
}

/**
 * Validates the Resources section
 */
function validateResources(resources: unknown): string | null {
  if (resources === undefined) {
    return "Template is missing required 'Resources' section.";
  }

  if (!isPlainObject(resources)) {
    return "Resources section must be an object.";
  }

  const resourceKeys = Object.keys(resources);

  if (resourceKeys.length === 0) {
    return "Resources section must contain at least one resource.";
  }

  // Validate logical ID format (must start with letter, alphanumeric only)
  const logicalIdPattern = /^[A-Za-z][A-Za-z0-9]*$/;

  for (const logicalId of resourceKeys) {
    if (!logicalIdPattern.test(logicalId)) {
      return `Invalid resource logical ID "${logicalId}": must start with a letter and contain only alphanumeric characters.`;
    }

    const resourceError = validateResource(logicalId, resources[logicalId]);
    if (resourceError) {
      return resourceError;
    }
  }

  return null;
}

/**
 * Validates the Parameters section if present
 */
function validateParameters(parameters: unknown): string | null {
  if (parameters === undefined) {
    return null;
  }

  if (!isPlainObject(parameters)) {
    return "Parameters section must be an object.";
  }

  for (const paramName of Object.keys(parameters)) {
    const param = parameters[paramName];

    if (!isPlainObject(param)) {
      return `Parameter "${paramName}" must be an object.`;
    }

    if (!("Type" in param)) {
      return `Parameter "${paramName}" is missing required "Type" property.`;
    }

    if (typeof param.Type !== "string") {
      return `Parameter "${paramName}" has invalid Type: must be a string.`;
    }
  }

  return null;
}

/**
 * Validates the Outputs section if present
 */
function validateOutputs(outputs: unknown): string | null {
  if (outputs === undefined) {
    return null;
  }

  if (!isPlainObject(outputs)) {
    return "Outputs section must be an object.";
  }

  for (const outputName of Object.keys(outputs)) {
    const output = outputs[outputName];

    if (!isPlainObject(output)) {
      return `Output "${outputName}" must be an object.`;
    }

    if (!("Value" in output)) {
      return `Output "${outputName}" is missing required "Value" property.`;
    }
  }

  return null;
}

/**
 * Validates the Mappings section if present
 */
function validateMappings(mappings: unknown): string | null {
  if (mappings === undefined) {
    return null;
  }

  if (!isPlainObject(mappings)) {
    return "Mappings section must be an object.";
  }

  for (const mapName of Object.keys(mappings)) {
    const mapValue = mappings[mapName];

    if (!isPlainObject(mapValue)) {
      return `Mapping "${mapName}" must be an object.`;
    }

    for (const topKey of Object.keys(mapValue)) {
      const secondLevel = mapValue[topKey];

      if (!isPlainObject(secondLevel)) {
        return `Mapping "${mapName}.${topKey}" must be an object.`;
      }
    }
  }

  return null;
}

/**
 * Validates the Conditions section if present
 */
function validateConditions(conditions: unknown): string | null {
  if (conditions === undefined) {
    return null;
  }

  if (!isPlainObject(conditions)) {
    return "Conditions section must be an object.";
  }

  return null;
}

/**
 * Validates the Transform section if present
 */
function validateTransform(transform: unknown): string | null {
  if (transform === undefined) {
    return null;
  }

  if (
    typeof transform !== "string" &&
    !(Array.isArray(transform) && transform.every((t) => typeof t === "string"))
  ) {
    return "Transform must be a string or array of strings.";
  }

  return null;
}

/**
 * Checks for unknown top-level keys in the template
 */
function validateTopLevelKeys(template: Record<string, unknown>): string | null {
  const unknownKeys = Object.keys(template).filter(
    (key) => !VALID_TEMPLATE_KEYS.has(key)
  );

  if (unknownKeys.length > 0) {
    return `Unknown top-level keys in template: ${unknownKeys.join(", ")}. Valid keys are: ${Array.from(VALID_TEMPLATE_KEYS).join(", ")}.`;
  }

  return null;
}

/**
 * Performs comprehensive validation of a CloudFormation template structure
 */
function validateTemplate(template: unknown): string | null {
  if (!isPlainObject(template)) {
    return "Template must be a JSON object.";
  }

  // Validate top-level keys
  const topLevelError = validateTopLevelKeys(template);
  if (topLevelError) {
    return topLevelError;
  }

  // Validate individual sections
  const validators = [
    () => validateTemplateVersion(template.AWSTemplateFormatVersion),
    () => validateDescription(template.Description),
    () => validateResources(template.Resources),
    () => validateParameters(template.Parameters),
    () => validateOutputs(template.Outputs),
    () => validateMappings(template.Mappings),
    () => validateConditions(template.Conditions),
    () => validateTransform(template.Transform),
  ];

  for (const validator of validators) {
    const error = validator();
    if (error) {
      return error;
    }
  }

  return null;
}

// =============================================================================
// Parser
// =============================================================================

/**
 * Parses a CloudFormation JSON template string into a typed structure.
 *
 * @param jsonString - The JSON string to parse
 * @returns A discriminated union indicating success with the parsed template,
 *          or failure with an error message
 *
 * @example
 * ```typescript
 * const result = parseTemplate(jsonString);
 * if (result.success) {
 *   console.log(result.template.Resources);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export function parseTemplate(jsonString: string): ParseResult {
  // Handle empty input
  if (!jsonString || jsonString.trim().length === 0) {
    return {
      success: false,
      error: "Input is empty or contains only whitespace.",
    };
  }

  // Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown parsing error";
    return {
      success: false,
      error: `Invalid JSON: ${message}`,
    };
  }

  // Validate template structure
  const validationError = validateTemplate(parsed);
  if (validationError) {
    return {
      success: false,
      error: validationError,
    };
  }

  // At this point, we know the template is valid
  // Cast is safe due to validation above
  return {
    success: true,
    template: parsed as CloudFormationTemplate,
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Extracts all resource logical IDs from a template
 */
export function getResourceIds(template: CloudFormationTemplate): string[] {
  return Object.keys(template.Resources);
}

/**
 * Gets a specific resource by its logical ID
 */
export function getResource(
  template: CloudFormationTemplate,
  logicalId: string
): CfnResource | undefined {
  return template.Resources[logicalId];
}

/**
 * Gets all resources of a specific type
 */
export function getResourcesByType(
  template: CloudFormationTemplate,
  resourceType: string
): Record<string, CfnResource> {
  const result: Record<string, CfnResource> = {};

  for (const [logicalId, resource] of Object.entries(template.Resources)) {
    if (resource.Type === resourceType) {
      result[logicalId] = resource;
    }
  }

  return result;
}

/**
 * Gets all unique resource types in a template
 */
export function getResourceTypes(template: CloudFormationTemplate): string[] {
  const types = new Set<string>();

  for (const resource of Object.values(template.Resources)) {
    types.add(resource.Type);
  }

  return Array.from(types).sort();
}

/**
 * Gets the dependencies for a specific resource
 */
export function getResourceDependencies(
  template: CloudFormationTemplate,
  logicalId: string
): string[] {
  const resource = template.Resources[logicalId];

  if (!resource) {
    return [];
  }

  if (!resource.DependsOn) {
    return [];
  }

  if (typeof resource.DependsOn === "string") {
    return [resource.DependsOn];
  }

  return resource.DependsOn;
}

/**
 * Gets all parameter names from a template
 */
export function getParameterNames(template: CloudFormationTemplate): string[] {
  if (!template.Parameters) {
    return [];
  }

  return Object.keys(template.Parameters);
}

/**
 * Gets all output names from a template
 */
export function getOutputNames(template: CloudFormationTemplate): string[] {
  if (!template.Outputs) {
    return [];
  }

  return Object.keys(template.Outputs);
}
