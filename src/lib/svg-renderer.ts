/**
 * SVG Renderer
 *
 * Pure TypeScript SVG generation for CloudFormation graphs.
 * No browser dependencies - generates raw SVG markup.
 */

import type { CfnNode, CfnEdge } from "../types/graph";
import { getServiceInfo, extractResourceName } from "./aws-icons";
import { getIconBase64 } from "./svg-icons";

// =============================================================================
// Constants (matching ResourceNode.tsx design tokens)
// =============================================================================

const NODE_WIDTH = 220;
const NODE_HEIGHT = 60;
const ICON_SIZE = 40;
const BORDER_RADIUS = 8;
const ICON_BORDER_RADIUS = 6;
const PADDING = 20;

const COLORS = {
  background: "#ffffff",
  border: "#d1d5db",
  textPrimary: "#16191f",
  textSecondary: "#5f6b7a",
  edge: "#687078",
  canvasBg: "#f9fafb",
  iconBg: "#687078",
};

const FONTS = {
  family: "'Amazon Ember', 'Helvetica Neue', Roboto, Arial, sans-serif",
  sizePrimary: 13,
  sizeSecondary: 11,
};

// =============================================================================
// Types
// =============================================================================

interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

// =============================================================================
// ViewBox Calculation
// =============================================================================

/**
 * Calculates the bounding box for all nodes with padding
 */
function calculateBoundingBox(nodes: CfnNode[]): BoundingBox {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 400, maxY: 200, width: 400, height: 200 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of nodes) {
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + NODE_WIDTH);
    maxY = Math.max(maxY, node.position.y + NODE_HEIGHT);
  }

  // Add padding around the content
  minX -= PADDING;
  minY -= PADDING;
  maxX += PADDING;
  maxY += PADDING;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

// =============================================================================
// XML Escaping
// =============================================================================

/**
 * Escapes special XML characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// =============================================================================
// Edge Rendering
// =============================================================================

/**
 * Renders a single edge as a Bezier curve
 */
function renderEdge(edge: CfnEdge, nodeMap: Map<string, CfnNode>): string {
  const sourceNode = nodeMap.get(edge.source);
  const targetNode = nodeMap.get(edge.target);

  if (!sourceNode || !targetNode) {
    return "";
  }

  // Source: right handle (x + NODE_WIDTH, y + NODE_HEIGHT/2)
  const x1 = sourceNode.position.x + NODE_WIDTH;
  const y1 = sourceNode.position.y + NODE_HEIGHT / 2;

  // Target: left handle (x, y + NODE_HEIGHT/2)
  const x2 = targetNode.position.x;
  const y2 = targetNode.position.y + NODE_HEIGHT / 2;

  // Control points for smooth bezier curve
  const dx = Math.abs(x2 - x1);
  const controlOffset = Math.max(dx * 0.4, 50);

  const cx1 = x1 + controlOffset;
  const cy1 = y1;
  const cx2 = x2 - controlOffset;
  const cy2 = y2;

  return `    <path
      d="M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}"
      fill="none"
      stroke="${COLORS.edge}"
      stroke-width="1.5"
      stroke-linecap="round"
    />`;
}

// =============================================================================
// Node Rendering
// =============================================================================

/**
 * Renders a single node as SVG
 */
function renderNode(node: CfnNode): string {
  const { position, data } = node;
  const { x, y } = position;
  const serviceInfo = getServiceInfo(data.resourceType);

  // Extract resource name (e.g., "Function" from "AWS::Lambda::Function")
  const resourceName = extractResourceName(data.resourceType);

  // Get icon as base64 data URI
  const iconDataUri = getIconBase64(data.resourceType);

  // Truncate long logical IDs
  const maxIdLength = 22;
  const displayId =
    data.logicalId.length > maxIdLength
      ? data.logicalId.substring(0, maxIdLength - 1) + "..."
      : data.logicalId;

  // Icon position (right side of node)
  const iconX = x + NODE_WIDTH - 14 - ICON_SIZE;
  const iconY = y + 10;

  const iconContent = iconDataUri
    ? `    <image
        x="${iconX}"
        y="${iconY}"
        width="${ICON_SIZE}"
        height="${ICON_SIZE}"
        href="${iconDataUri}"
        preserveAspectRatio="xMidYMid meet"
      />`
    : `    <rect
        x="${iconX}"
        y="${iconY}"
        width="${ICON_SIZE}"
        height="${ICON_SIZE}"
        rx="${ICON_BORDER_RADIUS}"
        fill="${COLORS.iconBg}"
      />
      <text
        x="${iconX + ICON_SIZE / 2}"
        y="${iconY + ICON_SIZE / 2 + 4}"
        text-anchor="middle"
        fill="#ffffff"
        font-size="12"
        font-weight="700"
        font-family="${FONTS.family}"
      >${escapeXml(serviceInfo.abbreviation)}</text>`;

  return `  <g class="node" data-id="${escapeXml(node.id)}">
    <!-- Node background with shadow -->
    <rect
      x="${x}"
      y="${y}"
      width="${NODE_WIDTH}"
      height="${NODE_HEIGHT}"
      rx="${BORDER_RADIUS}"
      fill="${COLORS.background}"
      stroke="${COLORS.border}"
      stroke-width="1"
      filter="url(#shadow)"
    />

    <!-- Resource type label -->
    <text
      x="${x + 14}"
      y="${y + 22}"
      fill="${COLORS.textSecondary}"
      font-size="${FONTS.sizeSecondary}"
      font-family="${FONTS.family}"
    >${escapeXml(resourceName)}</text>

    <!-- Logical ID -->
    <text
      x="${x + 14}"
      y="${y + 40}"
      fill="${COLORS.textPrimary}"
      font-size="${FONTS.sizePrimary}"
      font-weight="600"
      font-family="${FONTS.family}"
    >${escapeXml(displayId)}</text>

    <!-- Icon -->
${iconContent}
  </g>`;
}

// =============================================================================
// Main Renderer
// =============================================================================

/**
 * Renders a complete graph as SVG
 *
 * @param nodes - Array of positioned nodes
 * @param edges - Array of edges connecting nodes
 * @returns Complete SVG document as string
 */
export function renderGraphToSvg(nodes: CfnNode[], edges: CfnEdge[]): string {
  const bounds = calculateBoundingBox(nodes);
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Render edges first (below nodes)
  const edgesSvg = edges
    .map((edge) => renderEdge(edge, nodeMap))
    .filter(Boolean)
    .join("\n");

  // Render nodes
  const nodesSvg = nodes.map((node) => renderNode(node)).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="${bounds.width}"
  height="${bounds.height}"
  viewBox="${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}"
>
  <title>CloudFormation Template Diagram</title>

  <!-- Definitions -->
  <defs>
    <!-- Drop shadow filter -->
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000000" flood-opacity="0.1"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect
    x="${bounds.minX}"
    y="${bounds.minY}"
    width="${bounds.width}"
    height="${bounds.height}"
    fill="${COLORS.canvasBg}"
  />

  <!-- Edges (dependency arrows) -->
  <g class="edges">
${edgesSvg}
  </g>

  <!-- Nodes (resources) -->
  <g class="nodes">
${nodesSvg}
  </g>
</svg>`;
}

/**
 * Renders an error message as SVG
 *
 * @param message - Error message to display
 * @param statusCode - HTTP status code (for display)
 * @returns SVG document showing error
 */
export function renderErrorSvg(message: string, statusCode: number): string {
  const width = 500;
  const height = 120;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="${width}"
  height="${height}"
  viewBox="0 0 ${width} ${height}"
>
  <title>Error ${statusCode}</title>

  <!-- Background -->
  <rect width="100%" height="100%" fill="#fef2f2" rx="8"/>

  <!-- Border -->
  <rect
    x="1" y="1"
    width="${width - 2}" height="${height - 2}"
    fill="none"
    stroke="#fecaca"
    stroke-width="1"
    rx="7"
  />

  <!-- Error icon -->
  <circle cx="40" cy="60" r="20" fill="#dc2626"/>
  <text x="40" y="67" text-anchor="middle" fill="#ffffff" font-size="24" font-weight="bold">!</text>

  <!-- Error title -->
  <text
    x="80"
    y="50"
    fill="#991b1b"
    font-family="system-ui, sans-serif"
    font-size="16"
    font-weight="600"
  >Error ${statusCode}</text>

  <!-- Error message -->
  <text
    x="80"
    y="75"
    fill="#dc2626"
    font-family="system-ui, sans-serif"
    font-size="14"
  >${escapeXml(message.substring(0, 60))}${message.length > 60 ? "..." : ""}</text>
</svg>`;
}
