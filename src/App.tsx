import { useState, useCallback } from "react";
import AppLayout from "@cloudscape-design/components/app-layout";

import { InputPanel, GraphCanvas, DetailsPanel } from "@/components/organisms";
import { parseTemplate } from "@/lib/parser";
import { transformToGraph } from "@/lib/graph-transformer";
import { applyDagreLayout } from "@/lib/graph-layout";
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

  const handleVisualize = useCallback(async () => {
    setError(undefined);
    setIsProcessing(true);

    try {
      // Step 1: Parse the template
      const parseResult = parseTemplate(templateInput);

      if (!parseResult.success) {
        setError(parseResult.error);
        setIsProcessing(false);
        return;
      }

      // Step 2: Transform to graph
      const graphData = transformToGraph(parseResult.template);

      // Step 3: Apply layout
      const layoutedNodes = applyDagreLayout(graphData.nodes, graphData.edges);

      // Step 4: Update state
      setNodes(layoutedNodes);
      setEdges(graphData.edges);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  }, [templateInput]);

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
