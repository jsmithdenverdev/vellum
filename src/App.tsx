import { useState, useCallback } from "react";
import AppLayout from "@cloudscape-design/components/app-layout";
import TopNavigation from "@cloudscape-design/components/top-navigation";
import SplitPanel from "@cloudscape-design/components/split-panel";

import { InputPanel, GraphCanvas } from "@/components/organisms";
import { parseTemplate } from "@/lib/parser";
import { transformToGraph } from "@/lib/graph-transformer";
import { applyElkLayout } from "@/lib/graph-layout";
import type { CfnNode, CfnEdge } from "@/types/graph";

function App() {
  const [templateInput, setTemplateInput] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);

  // Graph state
  const [nodes, setNodes] = useState<CfnNode[]>([]);
  const [edges, setEdges] = useState<CfnEdge[]>([]);

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
      const layoutedNodes = await applyElkLayout(graphData.nodes, graphData.edges);

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
    <>
      <TopNavigation
        identity={{
          href: "#",
          title: "Vellum",
        }}
        utilities={[
          {
            type: "button",
            iconName: "external",
            text: "Documentation",
            href: "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/",
            external: true,
            externalIconAriaLabel: "(opens in a new tab)",
          },
        ]}
      />
      <AppLayout
        navigationHide
        toolsHide
        contentType="default"
        splitPanel={
          <SplitPanel header="Template Input" hidePreferencesButton closeBehavior="hide">
            <InputPanel
              value={templateInput}
              onChange={setTemplateInput}
              onVisualize={handleVisualize}
              error={error}
              isLoading={isProcessing}
            />
          </SplitPanel>
        }
        splitPanelOpen={true}
        splitPanelPreferences={{ position: "side" }}
        content={
          <GraphCanvas
            nodes={nodes}
            edges={edges}
            isLoading={isProcessing}
          />
        }
      />
    </>
  );
}

export default App;
