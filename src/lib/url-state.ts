/**
 * URL State Management
 *
 * Utilities for encoding/decoding CloudFormation templates in URL query parameters.
 * Uses lz-string compression to handle larger templates within URL length limits.
 */

import LZString from "lz-string";

// =============================================================================
// Constants
// =============================================================================

/** Query parameter name for the encoded template */
const TEMPLATE_PARAM = "template";

// =============================================================================
// Encoding/Decoding
// =============================================================================

/**
 * Encode template string to URL-safe compressed format.
 *
 * @param template - The raw template string (JSON or YAML)
 * @returns URL-safe compressed string
 */
export function encodeTemplate(template: string): string {
  return LZString.compressToEncodedURIComponent(template);
}

/**
 * Decode URL parameter back to template string.
 *
 * @param encoded - The compressed URL-safe string
 * @returns Original template string, or null if decoding fails
 */
export function decodeTemplate(encoded: string): string | null {
  try {
    const result = LZString.decompressFromEncodedURIComponent(encoded);
    // decompressFromEncodedURIComponent returns empty string for invalid input
    return result || null;
  } catch {
    return null;
  }
}

// =============================================================================
// URL Operations
// =============================================================================

/**
 * Get template from current URL query parameters.
 *
 * @returns The decoded template string, or null if not present or invalid
 */
export function getTemplateFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get(TEMPLATE_PARAM);

  if (!encoded) {
    return null;
  }

  return decodeTemplate(encoded);
}

/**
 * Update URL with encoded template without triggering page reload.
 * Uses history.replaceState to avoid cluttering browser history.
 *
 * @param template - The template string to encode and store in URL
 */
export function setTemplateInUrl(template: string): void {
  const encoded = encodeTemplate(template);
  const url = new URL(window.location.href);
  url.searchParams.set(TEMPLATE_PARAM, encoded);
  window.history.replaceState({}, "", url.toString());
}

/**
 * Remove template parameter from URL without triggering page reload.
 */
export function clearTemplateFromUrl(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete(TEMPLATE_PARAM);
  window.history.replaceState({}, "", url.toString());
}
