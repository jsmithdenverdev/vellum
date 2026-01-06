/**
 * Headless SVG Rendering API
 *
 * Netlify Function that generates SVG diagrams from CloudFormation templates.
 * Accepts lz-string compressed templates and returns raw SVG.
 *
 * Endpoint: GET /api/render.svg?template=<encoded>
 *
 * @example
 * curl "https://vellum.netlify.app/api/render.svg?template=N4Ig..." -o diagram.svg
 */

import LZString from "lz-string";

// Import shared modules using relative paths
// Note: These are bundled at build time by esbuild
import { parseTemplate } from "../../src/lib/parser";
import { transformToGraph } from "../../src/lib/graph-transformer";
import { applyDagreLayout } from "../../src/lib/graph-layout";
import { renderGraphToSvg, renderErrorSvg } from "../../src/lib/svg-renderer";

// =============================================================================
// Helpers
// =============================================================================

/**
 * Decode lz-string compressed template
 */
function decodeTemplate(encoded: string): string | null {
  try {
    const result = LZString.decompressFromEncodedURIComponent(encoded);
    return result || null;
  } catch {
    return null;
  }
}

/**
 * Create SVG response with appropriate headers
 */
function svgResponse(svg: string, status: number = 200): Response {
  return new Response(svg, {
    status,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": status === 200 ? "public, max-age=3600" : "no-cache",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
}

/**
 * Create error response as SVG (displayable as image)
 */
function errorResponse(status: number, message: string): Response {
  const svg = renderErrorSvg(message, status);
  return svgResponse(svg, status);
}

// =============================================================================
// Handler
// =============================================================================

export default async function handler(request: Request): Promise<Response> {
  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // Only allow GET requests
  if (request.method !== "GET") {
    return errorResponse(405, "Method not allowed. Use GET.");
  }

  // Extract query parameters
  const url = new URL(request.url);
  const encodedTemplate = url.searchParams.get("template");

  // Validate template parameter
  if (!encodedTemplate) {
    return errorResponse(
      400,
      "Missing 'template' query parameter. Encode your CFN template with lz-string."
    );
  }

  // Step 1: Decompress template
  const templateJson = decodeTemplate(encodedTemplate);
  if (!templateJson) {
    return errorResponse(
      400,
      "Failed to decompress template. Ensure valid lz-string encoding."
    );
  }

  // Step 2: Parse CloudFormation template
  const parseResult = parseTemplate(templateJson);
  if (!parseResult.success) {
    return errorResponse(400, `Parse error: ${parseResult.error}`);
  }

  // Step 3: Transform to graph
  const { nodes, edges } = transformToGraph(parseResult.template);

  if (nodes.length === 0) {
    return errorResponse(400, "Template contains no resources to visualize.");
  }

  // Step 4: Apply layout
  const layoutedNodes = applyDagreLayout(nodes, edges);

  // Step 5: Render to SVG
  try {
    const svg = renderGraphToSvg(layoutedNodes, edges);
    return svgResponse(svg);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown rendering error";
    console.error("SVG rendering failed:", message);
    return errorResponse(500, `Rendering failed: ${message}`);
  }
}
