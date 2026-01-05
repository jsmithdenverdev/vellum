/**
 * GraphCanvas Component
 *
 * Interactive graph visualization using React Flow to display
 * CloudFormation resource dependencies.
 */

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type NodeTypes,
  type ColorMode,
  BackgroundVariant,
} from "@xyflow/react";
import Box from "@cloudscape-design/components/box";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import Icon from "@cloudscape-design/components/icon";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Spinner from "@cloudscape-design/components/spinner";

import { ResourceNode } from "@/components/molecules";
import type { CfnNode, CfnEdge, CfnNodeData } from "@/types/graph";

// Import React Flow styles
import "@xyflow/react/dist/style.css";

// =============================================================================
// Types
// =============================================================================

export interface GraphCanvasProps {
  /** Nodes to display in the graph */
  nodes?: CfnNode[];
  /** Edges connecting the nodes */
  edges?: CfnEdge[];
  /** Whether the graph is currently being processed */
  isLoading?: boolean;
}

// =============================================================================
// Node Types Registration
// =============================================================================

const nodeTypes: NodeTypes = {
  cfnResource: ResourceNode,
};

// =============================================================================
// Styles
// =============================================================================

const containerStyles: React.CSSProperties = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
};

const flowContainerStyles: React.CSSProperties = {
  flex: 1,
  minHeight: "400px",
  backgroundColor: "#fafafa",
  borderRadius: "4px",
  overflow: "hidden",
};

const loadingOverlayStyles: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255, 255, 255, 0.85)",
  zIndex: 10,
  borderRadius: "4px",
};

// =============================================================================
// Component
// =============================================================================

/**
 * Placeholder content when no graph is available
 */
function EmptyState() {
  return (
    <Box
      display="block"
      textAlign="center"
      padding={{ vertical: "xxxl" }}
      color="text-body-secondary"
    >
      <SpaceBetween direction="vertical" size="s" alignItems="center">
        <Icon name="view-full" size="large" />
        <Box variant="p" color="text-body-secondary">
          Paste a CloudFormation template to visualize
        </Box>
        <Box variant="small" color="text-status-inactive">
          Supports both JSON and YAML formats
        </Box>
      </SpaceBetween>
    </Box>
  );
}

/**
 * Loading overlay displayed during graph processing
 */
function LoadingOverlay() {
  return (
    <div style={loadingOverlayStyles}>
      <SpaceBetween direction="vertical" size="s" alignItems="center">
        <Spinner size="large" />
        <Box variant="p" color="text-body-secondary">
          Processing template...
        </Box>
      </SpaceBetween>
    </div>
  );
}

/**
 * Extracts the AWS service name from a resource type
 */
function extractService(resourceType: string): string {
  const parts = resourceType.split("::");
  if (parts.length >= 2 && parts[0] === "AWS") {
    return parts[1];
  }
  return "Unknown";
}

/**
 * MiniMap node color function based on service type
 */
function getMiniMapNodeColor(node: Node): string {
  const data = node.data as CfnNodeData | undefined;
  if (!data?.resourceType) return "#687078";

  const service = extractService(data.resourceType);

  const serviceColors: Record<string, string> = {
    EC2: "#ff9900",
    S3: "#569a31",
    Lambda: "#ff9900",
    DynamoDB: "#4053d6",
    RDS: "#4053d6",
    IAM: "#dd344c",
    VPC: "#8c4fff",
  };

  return serviceColors[service] ?? "#687078";
}

/**
 * GraphCanvas component for visualizing CloudFormation dependencies
 */
export function GraphCanvas({
  nodes: initialNodes = [],
  edges: initialEdges = [],
  isLoading = false,
}: GraphCanvasProps) {
  // React Flow state management
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes/edges when props change
  useMemo(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Default edge options
  const defaultEdgeOptions = useMemo(
    () => ({
      type: "smoothstep" as const,
      style: {
        stroke: "#687078",
        strokeWidth: 1.5,
      },
    }),
    []
  );

  // Fit view options
  const fitViewOptions = useMemo(
    () => ({
      padding: 0.2,
      duration: 400,
    }),
    []
  );

  // Determine if we should show the empty state
  const showEmptyState = initialNodes.length === 0 && !isLoading;

  // Color mode for React Flow
  const colorMode: ColorMode = "light";

  return (
    <Container
      header={
        <Header
          variant="h2"
          description="Visual representation of resources and dependencies"
          counter={
            initialNodes.length > 0 ? `(${initialNodes.length} resources)` : undefined
          }
        >
          Resource Graph
        </Header>
      }
      fitHeight
    >
      <div style={containerStyles}>
        {showEmptyState ? (
          <EmptyState />
        ) : (
          <div style={{ ...flowContainerStyles, position: "relative" }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              defaultEdgeOptions={defaultEdgeOptions}
              fitView
              fitViewOptions={fitViewOptions}
              colorMode={colorMode}
              minZoom={0.1}
              maxZoom={2}
              nodesDraggable={true}
              nodesConnectable={false}
              elementsSelectable={true}
              panOnScroll={true}
              zoomOnScroll={true}
              preventScrolling={true}
              attributionPosition="bottom-left"
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={16}
                size={1}
                color="#d1d5db"
              />
              <Controls
                showZoom={true}
                showFitView={true}
                showInteractive={false}
                position="top-right"
              />
              <MiniMap
                nodeColor={getMiniMapNodeColor}
                maskColor="rgba(0, 0, 0, 0.1)"
                position="bottom-right"
                pannable
                zoomable
              />
            </ReactFlow>

            {/* Loading overlay */}
            {isLoading && <LoadingOverlay />}
          </div>
        )}
      </div>
    </Container>
  );
}
