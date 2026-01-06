/**
 * GraphCanvas Component
 *
 * Interactive graph visualization using React Flow to display
 * CloudFormation resource dependencies.
 */

import { useEffect, useMemo, useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  EdgeLabelRenderer,
  useNodesState,
  useEdgesState,
  getNodesBounds,
  getViewportForBounds,
  useReactFlow,
  BaseEdge,
  getBezierPath,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  type ColorMode,
  type NodeMouseHandler,
  type EdgeMouseHandler,
  type EdgeProps,
  BackgroundVariant,
} from "@xyflow/react";
import { toSvg } from "html-to-image";
import Button from "@cloudscape-design/components/button";
import Box from "@cloudscape-design/components/box";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import Icon from "@cloudscape-design/components/icon";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Spinner from "@cloudscape-design/components/spinner";

import { ResourceNode, SearchBar } from "@/components/molecules";
import { useTheme } from "@/hooks/useTheme";
import { useGraphSearch } from "@/hooks/useGraphSearch";
import { getCfnNodeData } from "@/types/graph";
import type { CfnNode, CfnEdge, CfnNodeData, CfnEdgeData } from "@/types/graph";

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
  /** Callback when a node is clicked */
  onNodeClick?: (nodeData: CfnNodeData) => void;
  /** Callback when a node is double-clicked */
  onNodeDoubleClick?: (nodeData: CfnNodeData) => void;
}

// =============================================================================
// Node Types Registration
// =============================================================================

const nodeTypes: NodeTypes = {
  cfnResource: ResourceNode,
};

// =============================================================================
// Custom Edge with Hover Label
// =============================================================================

/**
 * Props for the custom edge with hover label
 */
interface LabeledEdgeProps extends EdgeProps<Edge<CfnEdgeData>> {
  hoveredEdgeId: string | null;
  isDarkMode: boolean;
}

/**
 * Custom edge component that shows relationship type label on hover
 */
function LabeledEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  hoveredEdgeId,
  isDarkMode,
  style,
  markerEnd,
}: LabeledEdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const isHovered = hoveredEdgeId === id;

  // Format the label based on reference type
  const getEdgeLabel = (): string => {
    if (!data) return "";
    const { refType, attribute } = data;
    if (refType === "GetAtt" && attribute) {
      return `GetAtt: ${attribute}`;
    }
    return refType;
  };

  const labelText = getEdgeLabel();

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          strokeWidth: isHovered ? 2.5 : (style?.strokeWidth ?? 1.5),
          stroke: isHovered
            ? isDarkMode
              ? "#539fe5"
              : "#0972d3"
            : (style?.stroke ?? (isDarkMode ? "#7d8998" : "#687078")),
        }}
        markerEnd={markerEnd}
      />
      {isHovered && labelText && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "none",
              backgroundColor: isDarkMode ? "#232f3e" : "#ffffff",
              color: isDarkMode ? "#ffffff" : "#16191f",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: 500,
              fontFamily:
                '"Amazon Ember", "Helvetica Neue", Roboto, Arial, sans-serif',
              border: `1px solid ${isDarkMode ? "#3f4b5b" : "#d1d5db"}`,
              boxShadow: isDarkMode
                ? "0 2px 4px rgba(0, 0, 0, 0.3)"
                : "0 2px 4px rgba(0, 0, 0, 0.1)",
              zIndex: 1000,
            }}
          >
            {labelText}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

// =============================================================================
// Styles
// =============================================================================

const containerStyles: React.CSSProperties = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
};

/**
 * Get flow container styles based on theme
 */
function getFlowContainerStyles(isDarkMode: boolean): React.CSSProperties {
  return {
    flex: 1,
    minHeight: "400px",
    backgroundColor: isDarkMode ? "#0f1b2a" : "#fafafa",
    borderRadius: "4px",
    overflow: "hidden",
  };
}

/**
 * Get loading overlay styles based on theme
 */
function getLoadingOverlayStyles(isDarkMode: boolean): React.CSSProperties {
  return {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: isDarkMode
      ? "rgba(15, 27, 42, 0.85)"
      : "rgba(255, 255, 255, 0.85)",
    zIndex: 10,
    borderRadius: "4px",
  };
}

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
 * Skeleton placeholder for loading state
 */
function SkeletonNode({ isDarkMode, delay }: { isDarkMode: boolean; delay: number }) {
  const skeletonColor = isDarkMode ? "#3f4b5b" : "#d1d5db";
  const shimmerColor = isDarkMode ? "#4a5568" : "#e5e7eb";

  return (
    <div
      style={{
        width: "180px",
        height: "60px",
        backgroundColor: isDarkMode ? "#232f3e" : "#ffffff",
        borderRadius: "8px",
        border: `1px solid ${isDarkMode ? "#3f4b5b" : "#d1d5db"}`,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        animation: `pulse 1.5s ease-in-out ${delay}ms infinite`,
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        <div
          style={{
            width: "60%",
            height: "10px",
            backgroundColor: skeletonColor,
            borderRadius: "4px",
          }}
        />
        <div
          style={{
            width: "80%",
            height: "12px",
            backgroundColor: skeletonColor,
            borderRadius: "4px",
          }}
        />
      </div>
      <div
        style={{
          width: "40px",
          height: "40px",
          backgroundColor: shimmerColor,
          borderRadius: "6px",
        }}
      />
    </div>
  );
}

/**
 * Loading overlay with skeleton placeholder displayed during graph processing
 */
function LoadingOverlay({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div style={getLoadingOverlayStyles(isDarkMode)}>
      <SpaceBetween direction="vertical" size="l" alignItems="center">
        {/* Skeleton nodes to indicate graph loading */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            alignItems: "center",
          }}
        >
          <SkeletonNode isDarkMode={isDarkMode} delay={0} />
          <div style={{ display: "flex", gap: "40px" }}>
            <SkeletonNode isDarkMode={isDarkMode} delay={100} />
            <SkeletonNode isDarkMode={isDarkMode} delay={200} />
          </div>
        </div>

        {/* Status indicator */}
        <SpaceBetween direction="horizontal" size="xs" alignItems="center">
          <Spinner size="normal" />
          <Box variant="p" color="text-body-secondary">
            Parsing and laying out resources...
          </Box>
        </SpaceBetween>
      </SpaceBetween>

      {/* CSS animation for skeleton pulse */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
}

/**
 * Export button for downloading graph as SVG
 * Must be rendered inside ReactFlow to access the hook
 */
function ExportButton() {
  const { getNodes } = useReactFlow();

  const handleExport = useCallback(async () => {
    // Get the viewport element
    const viewport = document.querySelector(".react-flow__viewport") as HTMLElement;
    if (!viewport) {
      console.error("Could not find React Flow viewport");
      return;
    }

    try {
      // Get bounds for proper sizing
      const nodes = getNodes();
      const bounds = getNodesBounds(nodes);
      const padding = 50;
      const width = bounds.width + padding * 2;
      const height = bounds.height + padding * 2;

      // Calculate viewport transform for export
      const viewport_transform = getViewportForBounds(
        bounds,
        width,
        height,
        0.5,
        2,
        padding
      );

      const svg = await toSvg(viewport, {
        backgroundColor: "transparent",
        width,
        height,
        style: {
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(${viewport_transform.x}px, ${viewport_transform.y}px) scale(${viewport_transform.zoom})`,
        },
      });

      // Create download link
      const link = document.createElement("a");
      link.href = svg;
      link.download = "cloudformation-graph.svg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to export SVG:", error);
    }
  }, [getNodes]);

  return (
    <Button iconName="download" variant="icon" onClick={handleExport} ariaLabel="Export as SVG" />
  );
}

/**
 * Search panel component that must be rendered inside ReactFlow
 * to access the useReactFlow hook for zooming to matched nodes
 */
interface SearchPanelProps {
  nodes: CfnNode[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedServiceTypes: string[];
  onFilterChange: (types: string[]) => void;
  availableServiceTypes: ReturnType<typeof useGraphSearch>["availableServiceTypes"];
  onClear: () => void;
  isSearchActive: boolean;
  matchCount: number;
  matchingNodeIds: Set<string>;
}

function SearchPanel({
  nodes,
  searchTerm,
  onSearchChange,
  selectedServiceTypes,
  onFilterChange,
  availableServiceTypes,
  onClear,
  isSearchActive,
  matchCount,
  matchingNodeIds,
}: SearchPanelProps) {
  const { setCenter } = useReactFlow();

  // Zoom to first matching node
  const handleZoomToMatch = useCallback(() => {
    if (matchingNodeIds.size === 0) return;

    // Get the first matching node
    const firstMatchId = Array.from(matchingNodeIds)[0];
    const matchingNode = nodes.find((n) => n.id === firstMatchId);

    if (matchingNode && matchingNode.position) {
      // Center the view on the matching node
      setCenter(
        matchingNode.position.x + 110, // Center on node (node width ~220)
        matchingNode.position.y + 30, // Center on node (node height ~60)
        { zoom: 1, duration: 400 }
      );
    }
  }, [matchingNodeIds, nodes, setCenter]);

  // If there are no nodes, don't show the search bar
  if (nodes.length === 0) return null;

  return (
    <SearchBar
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      selectedServiceTypes={selectedServiceTypes}
      onFilterChange={onFilterChange}
      availableServiceTypes={availableServiceTypes}
      onClear={onClear}
      isSearchActive={isSearchActive}
      matchCount={matchCount}
      totalCount={nodes.length}
      onZoomToMatch={handleZoomToMatch}
    />
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
  const data = getCfnNodeData(node);
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
  onNodeClick,
  onNodeDoubleClick,
}: GraphCanvasProps) {
  // Theme context
  const { isDarkMode } = useTheme();

  // Track hovered edge for label display
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);

  // Search and filter functionality
  const {
    searchTerm,
    setSearchTerm,
    selectedServiceTypes,
    setSelectedServiceTypes,
    availableServiceTypes,
    matchingNodeIds,
    isSearchActive,
    clearSearch,
  } = useGraphSearch(initialNodes);

  // Apply search/filter state to nodes
  const nodesWithSearchState = useMemo(() => {
    if (!isSearchActive) return initialNodes;

    return initialNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        isDimmed: !matchingNodeIds.has(node.id),
        isHighlighted: matchingNodeIds.has(node.id),
      },
    }));
  }, [initialNodes, isSearchActive, matchingNodeIds]);

  // React Flow state management
  const [nodes, setNodes, onNodesChange] = useNodesState(nodesWithSearchState);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes/edges when props or search state changes
  useEffect(() => {
    setNodes(nodesWithSearchState);
    setEdges(initialEdges);
  }, [nodesWithSearchState, initialEdges, setNodes, setEdges]);

  // Enable virtualization for large graphs (>50 nodes)
  const shouldVirtualize = initialNodes.length > 50;

  // Create custom edge types with hover state
  const edgeTypes: EdgeTypes = useMemo(
    () => ({
      labeled: (props: EdgeProps<Edge<CfnEdgeData>>) => (
        <LabeledEdge
          {...props}
          hoveredEdgeId={hoveredEdgeId}
          isDarkMode={isDarkMode}
        />
      ),
    }),
    [hoveredEdgeId, isDarkMode]
  );

  // Default edge options - theme aware, use custom labeled edge type
  const defaultEdgeOptions = useMemo(
    () => ({
      type: "labeled" as const,
      style: {
        stroke: isDarkMode ? "#7d8998" : "#687078",
        strokeWidth: 1.5,
      },
    }),
    [isDarkMode]
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

  // Color mode for React Flow - based on theme
  const colorMode: ColorMode = isDarkMode ? "dark" : "light";

  // Background dot color based on theme
  const backgroundDotColor = isDarkMode ? "#414d5c" : "#d1d5db";

  // Handle node click
  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      const nodeData = getCfnNodeData(node);
      if (onNodeClick && nodeData) {
        onNodeClick(nodeData);
      }
    },
    [onNodeClick]
  );

  // Handle node double-click
  const handleNodeDoubleClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      const nodeData = getCfnNodeData(node);
      if (onNodeDoubleClick && nodeData) {
        onNodeDoubleClick(nodeData);
      }
    },
    [onNodeDoubleClick]
  );

  // Handle edge mouse enter for hover label
  const handleEdgeMouseEnter: EdgeMouseHandler = useCallback((_event, edge) => {
    setHoveredEdgeId(edge.id);
  }, []);

  // Handle edge mouse leave
  const handleEdgeMouseLeave: EdgeMouseHandler = useCallback(() => {
    setHoveredEdgeId(null);
  }, []);

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
          <div style={{ ...getFlowContainerStyles(isDarkMode), position: "relative" }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={handleNodeClick}
              onNodeDoubleClick={handleNodeDoubleClick}
              onEdgeMouseEnter={handleEdgeMouseEnter}
              onEdgeMouseLeave={handleEdgeMouseLeave}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
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
              onlyRenderVisibleElements={shouldVirtualize}
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={16}
                size={1}
                color={backgroundDotColor}
              />
              <Controls
                showZoom={true}
                showFitView={true}
                showInteractive={false}
                position="top-right"
              />
              <Panel position="top-left">
                <SpaceBetween direction="horizontal" size="xs" alignItems="center">
                  <ExportButton />
                </SpaceBetween>
              </Panel>
              <Panel position="top-center">
                <SearchPanel
                  nodes={initialNodes}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  selectedServiceTypes={selectedServiceTypes}
                  onFilterChange={setSelectedServiceTypes}
                  availableServiceTypes={availableServiceTypes}
                  onClear={clearSearch}
                  isSearchActive={isSearchActive}
                  matchCount={matchingNodeIds.size}
                  matchingNodeIds={matchingNodeIds}
                />
              </Panel>
              <MiniMap
                nodeColor={getMiniMapNodeColor}
                maskColor={isDarkMode ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.1)"}
                position="bottom-right"
                pannable
                zoomable
              />
            </ReactFlow>

            {/* Loading overlay */}
            {isLoading && <LoadingOverlay isDarkMode={isDarkMode} />}
          </div>
        )}
      </div>
    </Container>
  );
}
