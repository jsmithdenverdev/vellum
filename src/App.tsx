import { useState, useCallback, useEffect } from "react";
import AppLayout from "@cloudscape-design/components/app-layout";

import { InputPanel, GraphCanvas, DetailsPanel } from "@/components/organisms";
import { parseTemplate } from "@/lib/parser";
import { transformToGraph } from "@/lib/graph-transformer";
import { applyDagreLayout } from "@/lib/graph-layout";
import { getTemplateFromUrl, setTemplateInUrl } from "@/lib/url-state";
import type { CfnNode, CfnEdge, CfnNodeData } from "@/types/graph";

function App() {
  const [templateInput, setTemplateInput] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [navigationOpen, setNavigationOpen] = useState(true);

  // Dark mode state - could be moved to context in the future
  const [isDarkMode] = useState(false);

  // Graph state
  const [nodes, setNodes] = useState<CfnNode[]>([]);
  const [edges, setEdges] = useState<CfnEdge[]>([]);

  // Details panel state
  const [selectedNode, setSelectedNode] = useState<CfnNodeData | null>(null);
  const [toolsOpen, setToolsOpen] = useState(false);

  // Handle node click - update selection if panel is already open
  const handleNodeClick = useCallback((nodeData: CfnNodeData) => {
    if (toolsOpen) {
      setSelectedNode(nodeData);
    }
  }, [toolsOpen]);

  // Handle node double-click to open details panel
  const handleNodeDoubleClick = useCallback((nodeData: CfnNodeData) => {
    setSelectedNode(nodeData);
    setToolsOpen(true);
  }, []);

  // Core visualization logic - can be called with any template string
  const visualizeTemplate = useCallback((template: string, updateUrl = true) => {
    setError(undefined);
    setIsProcessing(true);

    try {
      // Step 1: Parse the template
      const parseResult = parseTemplate(template);

      if (!parseResult.success) {
        setError(parseResult.error);
        return;
      }

      // Step 2: Transform to graph
      const graphData = transformToGraph(parseResult.template);

      // Step 3: Apply layout
      const layoutedNodes = applyDagreLayout(graphData.nodes, graphData.edges);

      // Step 4: Update state
      setNodes(layoutedNodes);
      setEdges(graphData.edges);

      // Step 5: Update URL for sharing (if requested)
      if (updateUrl) {
        setTemplateInUrl(template);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Handler for visualize button click
  const handleVisualize = useCallback(() => {
    visualizeTemplate(templateInput);
  }, [templateInput, visualizeTemplate]);

  // Load template from URL on mount
  useEffect(() => {
    const urlTemplate = getTemplateFromUrl();
    if (urlTemplate) {
      setTemplateInput(urlTemplate);
      visualizeTemplate(urlTemplate, false); // Don't update URL since it's already there
    }
  }, [visualizeTemplate]);

  return (
    <AppLayout
      navigation={
        <InputPanel
          value={templateInput}
          onChange={setTemplateInput}
          onVisualize={handleVisualize}
          error={error}
          isLoading={isProcessing}
          isDarkMode={isDarkMode}
        />
      }
      navigationOpen={navigationOpen}
      onNavigationChange={({ detail }) => setNavigationOpen(detail.open)}
      navigationWidth={400}
      tools={<DetailsPanel nodeData={selectedNode} />}
      toolsOpen={toolsOpen}
      onToolsChange={({ detail }) => setToolsOpen(detail.open)}
      toolsWidth={350}
      content={
        <GraphCanvas
          nodes={nodes}
          edges={edges}
          isLoading={isProcessing}
          onNodeClick={handleNodeClick}
          onNodeDoubleClick={handleNodeDoubleClick}
        />
      }
    />
  );
}

export default App;
