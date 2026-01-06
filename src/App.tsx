import { useState, useCallback, useRef, useMemo, useEffect } from "react";

import { ErrorBoundary } from "@/components/atoms";
import { GraphErrorFallback } from "@/components/molecules";
import { InputPanel, GraphCanvas, DetailsPanel } from "@/components/organisms";
import { SplitViewLayout } from "@/components/templates";
import { useUrlState, useVisualization, useGlobalErrorHandler } from "@/hooks";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { setTemplateInUrl } from "@/lib/url-state";

import type { CfnNodeData } from "@/types/graph";

function App() {
  // URL state management
  const { template, setTemplate, isInitialized } = useUrlState();

  // Visualization pipeline
  const { nodes, edges, error, isLoading, visualize, status, reset } =
    useVisualization();

  // Layout state
  const [navigationOpen, setNavigationOpen] = useState(true);

  // Details panel state
  const [selectedNode, setSelectedNode] = useState<CfnNodeData | null>(null);
  const [toolsOpen, setToolsOpen] = useState(false);

  // Error boundary key - incrementing this resets the error boundary
  const [errorBoundaryKey, setErrorBoundaryKey] = useState(0);

  // Global error handler for uncaught errors
  useGlobalErrorHandler();

  // Ref for focusing the graph canvas after visualization
  const graphContainerRef = useRef<HTMLDivElement>(null);

  // Derive status message from visualization state (no effect needed)
  const statusMessage = useMemo(() => {
    if (isLoading) {
      return "Processing CloudFormation template...";
    }
    if (error) {
      return `Error: ${error}`;
    }
    if (nodes.length > 0) {
      return `Visualization complete. ${nodes.length} resources and ${edges.length} dependencies displayed.`;
    }
    return "";
  }, [isLoading, error, nodes.length, edges.length]);

  // Focus graph canvas when visualization completes
  useEffect(() => {
    if (status === "complete" && graphContainerRef.current) {
      // Use setTimeout to ensure DOM has updated
      const timeoutId = setTimeout(() => {
        const graphElement = graphContainerRef.current?.querySelector(
          ".react-flow"
        ) as HTMLElement | null;
        if (graphElement) {
          graphElement.focus();
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [status]);

  // Auto-visualize template from URL on mount
  useEffect(() => {
    if (isInitialized && template) {
      visualize(template);
    }
    // Only run once on initialization - template changes handled by button
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]);

  // Handle node click - update selection if panel is already open
  const handleNodeClick = useCallback(
    (nodeData: CfnNodeData) => {
      if (toolsOpen) {
        setSelectedNode(nodeData);
      }
    },
    [toolsOpen]
  );

  // Handle node double-click to open details panel
  const handleNodeDoubleClick = useCallback((nodeData: CfnNodeData) => {
    setSelectedNode(nodeData);
    setToolsOpen(true);
  }, []);

  // Handler for visualize button click
  const handleVisualize = useCallback(() => {
    visualize(template);

    // Update URL after visualization
    if (template.trim()) {
      setTemplateInUrl(template);
    }
  }, [template, visualize]);

  // Handle template input change (don't update URL on every keystroke)
  const handleTemplateChange = useCallback(
    (value: string) => {
      setTemplate(value, false); // Don't update URL on change
    },
    [setTemplate]
  );

  // Handle escape key to close panels
  const handleEscape = useCallback(() => {
    // Close details panel first if open
    if (toolsOpen) {
      setToolsOpen(false);
      setSelectedNode(null);
      return;
    }
    // Then close navigation panel if open
    if (navigationOpen) {
      setNavigationOpen(false);
    }
  }, [toolsOpen, navigationOpen]);

  // Handle search (future functionality - placeholder for Cmd/Ctrl+K)
  const handleSearch = useCallback(() => {
    // TODO: Implement search functionality
    // For now, this is a placeholder that could open a search modal
    console.log("Search shortcut triggered - feature coming soon");
  }, []);

  // Register keyboard shortcuts
  useKeyboardShortcuts({
    onVisualize: handleVisualize,
    onEscape: handleEscape,
    onSearch: handleSearch,
  });

  // Handle error boundary reset - re-render the graph
  const handleErrorBoundaryReset = useCallback(() => {
    setErrorBoundaryKey((prev) => prev + 1);
  }, []);

  // Handle clearing the template when error occurs
  const handleClearTemplate = useCallback(() => {
    setTemplate("", false);
    reset();
    setErrorBoundaryKey((prev) => prev + 1);
  }, [setTemplate, reset]);

  return (
    <>
      {/* Aria-live region for screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {statusMessage}
      </div>

      <SplitViewLayout
        navigation={
          <InputPanel
            value={template}
            onChange={handleTemplateChange}
            onVisualize={handleVisualize}
            error={error}
            isLoading={isLoading}
          />
        }
        navigationOpen={navigationOpen}
        onNavigationChange={setNavigationOpen}
        navigationWidth={400}
        tools={<DetailsPanel nodeData={selectedNode} />}
        toolsOpen={toolsOpen}
        onToolsChange={setToolsOpen}
        toolsWidth={350}
        content={
          <div ref={graphContainerRef} style={{ height: "100%" }}>
            <ErrorBoundary
              key={errorBoundaryKey}
              fallback={
                <GraphErrorFallback
                  onReset={handleErrorBoundaryReset}
                  onClearTemplate={handleClearTemplate}
                />
              }
              onReset={handleErrorBoundaryReset}
            >
              <GraphCanvas
                nodes={nodes}
                edges={edges}
                isLoading={isLoading}
                onNodeClick={handleNodeClick}
                onNodeDoubleClick={handleNodeDoubleClick}
              />
            </ErrorBoundary>
          </div>
        }
      />
    </>
  );
}

export default App;
