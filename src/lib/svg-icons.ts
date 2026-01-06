/**
 * SVG Icons for Server-Side Rendering
 *
 * Provides base64-encoded AWS icons for embedding in generated SVGs.
 * Icons are pre-processed at build time to avoid filesystem access at runtime.
 */

import iconCache from "./icon-cache.json";
import { getServiceInfo } from "./aws-icons";

const cache = iconCache as Record<string, string>;

/**
 * Gets a base64 data URI for an AWS service icon.
 *
 * @param resourceType - CloudFormation resource type (e.g., "AWS::Lambda::Function")
 * @returns Data URI string or undefined if no icon available
 *
 * @example
 * const dataUri = getIconBase64("AWS::Lambda::Function");
 * // "data:image/svg+xml;base64,PHN2Zy..."
 */
export function getIconBase64(resourceType: string): string | undefined {
  const serviceInfo = getServiceInfo(resourceType);

  if (!serviceInfo.iconFile) {
    return undefined;
  }

  const base64 = cache[serviceInfo.iconFile];
  if (!base64) {
    return undefined;
  }

  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Gets all available icon names (for debugging/testing)
 *
 * @returns Array of icon filenames (without extension)
 */
export function getAvailableIcons(): string[] {
  return Object.keys(cache);
}

/**
 * Checks if an icon is available for a resource type
 *
 * @param resourceType - CloudFormation resource type
 * @returns true if icon is available
 */
export function hasIcon(resourceType: string): boolean {
  const serviceInfo = getServiceInfo(resourceType);
  return !!serviceInfo.iconFile && !!cache[serviceInfo.iconFile];
}
