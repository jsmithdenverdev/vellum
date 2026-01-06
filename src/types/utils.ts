/**
 * Utility Types Module
 *
 * Reusable TypeScript utility types for the CloudFormation visualizer.
 * Provides branded types, recursive utilities, and common type patterns.
 */

// =============================================================================
// Basic Utility Types
// =============================================================================

/**
 * Makes a type nullable (T | null)
 *
 * @example
 * ```typescript
 * type MaybeString = Nullable<string>; // string | null
 * ```
 */
export type Nullable<T> = T | null;

/**
 * Makes a type optional (T | undefined)
 *
 * @example
 * ```typescript
 * type OptionalNumber = Optional<number>; // number | undefined
 * ```
 */
export type Optional<T> = T | undefined;

/**
 * Makes all properties of T recursively partial
 *
 * @example
 * ```typescript
 * interface Config {
 *   server: {
 *     host: string;
 *     port: number;
 *   };
 * }
 * type PartialConfig = DeepPartial<Config>;
 * // { server?: { host?: string; port?: number; } | undefined }
 * ```
 */
export type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

/**
 * Makes all properties of T recursively required
 *
 * @example
 * ```typescript
 * type RequiredConfig = DeepRequired<PartialConfig>;
 * ```
 */
export type DeepRequired<T> = T extends object
  ? { [P in keyof T]-?: DeepRequired<T[P]> }
  : T;

/**
 * Makes all properties of T recursively readonly
 *
 * @example
 * ```typescript
 * type ImmutableConfig = DeepReadonly<Config>;
 * ```
 */
export type DeepReadonly<T> = T extends object
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T;

// =============================================================================
// Branded Types
// =============================================================================

/**
 * Creates a branded/nominal type from a base type.
 * Branded types are structurally incompatible with their base type,
 * preventing accidental misuse of similar primitive types.
 */
declare const __brand: unique symbol;
type Brand<B> = { [__brand]: B };

/**
 * Creates a branded type from base type T with brand B
 *
 * @example
 * ```typescript
 * type UserId = Branded<string, 'UserId'>;
 * type OrderId = Branded<string, 'OrderId'>;
 *
 * const userId: UserId = 'user-123' as UserId;
 * const orderId: OrderId = userId; // Error: Type 'UserId' is not assignable to type 'OrderId'
 * ```
 */
export type Branded<T, B> = T & Brand<B>;

/**
 * CloudFormation resource logical ID.
 * Must start with a letter and contain only alphanumeric characters.
 *
 * @example
 * ```typescript
 * const logicalId: LogicalId = 'MyBucket' as LogicalId;
 * ```
 */
export type LogicalId = Branded<string, "LogicalId">;

/**
 * React Flow edge identifier.
 * Typically in the format "source-target" or "source-target-refType".
 *
 * @example
 * ```typescript
 * const edgeId: EdgeId = 'MyLambda-MyBucket-Ref' as EdgeId;
 * ```
 */
export type EdgeId = Branded<string, "EdgeId">;

/**
 * React Flow node identifier.
 * For CFN nodes, this is the same as the LogicalId.
 *
 * @example
 * ```typescript
 * const nodeId: NodeId = 'MyBucket' as NodeId;
 * ```
 */
export type NodeId = Branded<string, "NodeId">;

/**
 * AWS resource type string (e.g., "AWS::S3::Bucket")
 *
 * @example
 * ```typescript
 * const resourceType: AwsResourceType = 'AWS::Lambda::Function' as AwsResourceType;
 * ```
 */
export type AwsResourceType = Branded<string, "AwsResourceType">;

// =============================================================================
// Type Constructors
// =============================================================================

/**
 * Creates a LogicalId from a string.
 * Use this function to create branded LogicalId values.
 *
 * @param id - The logical ID string
 * @returns A branded LogicalId
 */
export function createLogicalId(id: string): LogicalId {
  return id as LogicalId;
}

/**
 * Creates an EdgeId from source and target node IDs.
 *
 * @param source - The source node ID
 * @param target - The target node ID
 * @param refType - Optional reference type for disambiguation
 * @returns A branded EdgeId
 */
export function createEdgeId(
  source: string,
  target: string,
  refType?: string
): EdgeId {
  const base = `${source}-${target}`;
  return (refType ? `${base}-${refType}` : base) as EdgeId;
}

/**
 * Creates a NodeId from a string.
 *
 * @param id - The node ID string
 * @returns A branded NodeId
 */
export function createNodeId(id: string): NodeId {
  return id as NodeId;
}

/**
 * Creates an AwsResourceType from a string.
 *
 * @param type - The AWS resource type string
 * @returns A branded AwsResourceType
 */
export function createAwsResourceType(type: string): AwsResourceType {
  return type as AwsResourceType;
}

// =============================================================================
// Object Utility Types
// =============================================================================

/**
 * Extracts keys of T that have values of type V
 *
 * @example
 * ```typescript
 * interface Person { name: string; age: number; active: boolean; }
 * type StringKeys = KeysOfType<Person, string>; // 'name'
 * ```
 */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

/**
 * Picks properties from T where the value extends V
 *
 * @example
 * ```typescript
 * type StringProps = PickByType<Person, string>; // { name: string }
 * ```
 */
export type PickByType<T, V> = Pick<T, KeysOfType<T, V>>;

/**
 * Omits properties from T where the value extends V
 *
 * @example
 * ```typescript
 * type NonStringProps = OmitByType<Person, string>; // { age: number; active: boolean }
 * ```
 */
export type OmitByType<T, V> = Omit<T, KeysOfType<T, V>>;

/**
 * Makes specified keys K of T required while keeping others optional
 *
 * @example
 * ```typescript
 * type Config = { host?: string; port?: number; timeout?: number };
 * type RequiredHost = RequireKeys<Config, 'host'>; // { host: string; port?: number; timeout?: number }
 * ```
 */
export type RequireKeys<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

/**
 * Makes specified keys K of T optional while keeping others required
 *
 * @example
 * ```typescript
 * type Config = { host: string; port: number; timeout: number };
 * type OptionalTimeout = OptionalKeys<Config, 'timeout'>; // { host: string; port: number; timeout?: number }
 * ```
 */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

// =============================================================================
// Function Utility Types
// =============================================================================

/**
 * Extracts the return type of an async function
 *
 * @example
 * ```typescript
 * async function fetchData(): Promise<{ id: string }> { ... }
 * type Data = AsyncReturnType<typeof fetchData>; // { id: string }
 * ```
 */
export type AsyncReturnType<T extends (...args: unknown[]) => Promise<unknown>> =
  T extends (...args: unknown[]) => Promise<infer R> ? R : never;

/**
 * Creates a type that represents a function with the same signature as F
 * but returns void (useful for event handlers)
 *
 * @example
 * ```typescript
 * type Handler = VoidFunction<(event: MouseEvent) => boolean>; // (event: MouseEvent) => void
 * ```
 */
export type VoidFunction<F extends (...args: never[]) => unknown> = (
  ...args: Parameters<F>
) => void;

// =============================================================================
// Discriminated Union Helpers
// =============================================================================

/**
 * Extracts the successful result type from a discriminated union with a 'success' field
 *
 * @example
 * ```typescript
 * type Result = { success: true; data: string } | { success: false; error: Error };
 * type SuccessData = ExtractSuccess<Result>; // { success: true; data: string }
 * ```
 */
export type ExtractSuccess<T extends { success: boolean }> = Extract<
  T,
  { success: true }
>;

/**
 * Extracts the failure result type from a discriminated union with a 'success' field
 *
 * @example
 * ```typescript
 * type FailureData = ExtractFailure<Result>; // { success: false; error: Error }
 * ```
 */
export type ExtractFailure<T extends { success: boolean }> = Extract<
  T,
  { success: false }
>;

// =============================================================================
// Array Utility Types
// =============================================================================

/**
 * Extracts the element type from an array type
 *
 * @example
 * ```typescript
 * type Item = ArrayElement<string[]>; // string
 * ```
 */
export type ArrayElement<T extends readonly unknown[]> =
  T extends readonly (infer E)[] ? E : never;

/**
 * Creates a non-empty array type
 *
 * @example
 * ```typescript
 * type NonEmptyStrings = NonEmptyArray<string>; // [string, ...string[]]
 * ```
 */
export type NonEmptyArray<T> = [T, ...T[]];

// =============================================================================
// Type Assertions
// =============================================================================

/**
 * Asserts that a value is not null or undefined.
 * Throws an error if the assertion fails.
 *
 * @param value - The value to check
 * @param message - Optional error message
 * @throws Error if value is null or undefined
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message = "Value is null or undefined"
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
}

/**
 * Asserts that a condition is true.
 * Narrows the type in TypeScript's control flow analysis.
 *
 * @param condition - The condition to check
 * @param message - Optional error message
 * @throws Error if condition is false
 */
export function assert(
  condition: boolean,
  message = "Assertion failed"
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
