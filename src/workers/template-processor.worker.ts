/**
 * Template Processor Web Worker
 *
 * Offloads the CPU-intensive template processing pipeline to a background thread.
 * This includes JSON parsing, CFN validation, graph transformation, and layout calculation.
 */

import { parseTemplate } from "../lib/parser";
import { transformToGraph } from "../lib/graph-transformer";
import { layoutGraph } from "../lib/graph-layout";

import type { CfnNode, CfnEdge } from "../types/graph";
import type { WorkerRequest, WorkerResponse } from "../types/worker";

// =============================================================================
// Internal Types
// =============================================================================

interface ProcessSuccess {
  success: true;
  nodes: CfnNode[];
  edges: CfnEdge[];
}

interface ProcessFailure {
  success: false;
  error: string;
}

type ProcessResultInternal = ProcessSuccess | ProcessFailure;

// =============================================================================
// Message Handler
// =============================================================================

/**
 * Process a CloudFormation template through the full pipeline:
 * 1. Parse JSON and validate CFN structure
 * 2. Transform to graph nodes and edges
 * 3. Apply automatic layout
 */
function processTemplate(templateString: string): ProcessResultInternal {
  // Step 1: Parse the template
  const parseResult = parseTemplate(templateString);

  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error,
    };
  }

  // Step 2: Transform to graph
  const graphData = transformToGraph(parseResult.template);

  // Step 3: Apply layout
  const layoutedGraph = layoutGraph(graphData.nodes, graphData.edges);

  return {
    success: true,
    nodes: layoutedGraph.nodes,
    edges: layoutedGraph.edges,
  };
}

/**
 * Handle incoming messages from the main thread
 */
self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { type, id, payload } = event.data;

  if (type !== "PROCESS_TEMPLATE") {
    const response: WorkerResponse = {
      type: "ERROR",
      id,
      payload: {
        error: `Unknown message type: ${type}`,
      },
    };
    self.postMessage(response);
    return;
  }

  try {
    const result = processTemplate(payload.templateString);

    if (result.success) {
      const response: WorkerResponse = {
        type: "SUCCESS",
        id,
        payload: {
          nodes: result.nodes,
          edges: result.edges,
        },
      };
      self.postMessage(response);
    } else {
      const response: WorkerResponse = {
        type: "ERROR",
        id,
        payload: {
          error: result.error,
        },
      };
      self.postMessage(response);
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred in worker";
    const response: WorkerResponse = {
      type: "ERROR",
      id,
      payload: {
        error: errorMessage,
      },
    };
    self.postMessage(response);
  }
};

// Signal that the worker is ready
self.postMessage({ type: "READY" });
