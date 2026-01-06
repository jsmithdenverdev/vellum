/**
 * useVisualization Hook
 *
 * Consolidates visualization state and logic using useReducer pattern.
 * Combines parsing, graph transformation, and layout into a single pipeline.
 *
 * For large templates (50k+ characters), processing is automatically offloaded
 * to a Web Worker to prevent UI blocking.
 */

import { useReducer, useCallback, useRef, useEffect } from "react";

import { useTemplateWorker } from "./useTemplateWorker";
import { parseTemplate } from "@/lib/parser";
import { transformToGraph } from "@/lib/graph-transformer";
import { layoutGraph } from "@/lib/graph-layout";

import type { CfnNode, CfnEdge } from "@/types/graph";
import type { ProcessResult } from "@/types/worker";

// =============================================================================
// Configuration
// =============================================================================

/**
 * Threshold for using the worker (in characters).
 * Templates larger than this will use the worker to avoid blocking the main thread.
 */
const WORKER_THRESHOLD_CHARS = 50_000;

// =============================================================================
// State Types
// =============================================================================

/**
 * Visualization processing states
 */
export type VisualizationStatus =
  | "idle"
  | "parsing"
  | "transforming"
  | "layouting"
  | "processing" // Worker-based processing (combined steps)
  | "complete"
  | "error";

/**
 * Visualization state shape
 */
export interface VisualizationState {
  /** Current processing status */
  status: VisualizationStatus;
  /** Graph nodes with positions */
  nodes: CfnNode[];
  /** Graph edges (dependencies) */
  edges: CfnEdge[];
  /** Error message if status is 'error' */
  error: string | undefined;
}

// =============================================================================
// Action Types
// =============================================================================

type VisualizationAction =
  | { type: "START_PARSING" }
  | { type: "START_TRANSFORMING" }
  | { type: "START_LAYOUTING" }
  | { type: "START_PROCESSING" } // Worker-based processing
  | { type: "COMPLETE"; nodes: CfnNode[]; edges: CfnEdge[] }
  | { type: "ERROR"; error: string }
  | { type: "RESET" };

// =============================================================================
// Reducer
// =============================================================================

const initialState: VisualizationState = {
  status: "idle",
  nodes: [],
  edges: [],
  error: undefined,
};

function visualizationReducer(
  state: VisualizationState,
  action: VisualizationAction
): VisualizationState {
  switch (action.type) {
    case "START_PARSING":
      return {
        ...state,
        status: "parsing",
        error: undefined,
      };

    case "START_TRANSFORMING":
      return {
        ...state,
        status: "transforming",
      };

    case "START_LAYOUTING":
      return {
        ...state,
        status: "layouting",
      };

    case "START_PROCESSING":
      return {
        ...state,
        status: "processing",
        error: undefined,
      };

    case "COMPLETE":
      return {
        status: "complete",
        nodes: action.nodes,
        edges: action.edges,
        error: undefined,
      };

    case "ERROR":
      return {
        ...state,
        status: "error",
        error: action.error,
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

// =============================================================================
// Hook Options
// =============================================================================

/**
 * Options for the useVisualization hook
 */
export interface UseVisualizationOptions {
  /**
   * Force synchronous processing regardless of template size.
   * Useful for testing or environments where workers aren't supported.
   * @default false
   */
  forceSync?: boolean;

  /**
   * Custom threshold for using the worker (in characters).
   * Templates larger than this will use the worker.
   * @default 50000
   */
  workerThreshold?: number;
}

// =============================================================================
// Hook Return Type
// =============================================================================

/**
 * Return type for the useVisualization hook
 */
export interface UseVisualizationReturn {
  /** Graph nodes with calculated positions */
  nodes: CfnNode[];
  /** Graph edges representing dependencies */
  edges: CfnEdge[];
  /** Current error message, if any */
  error: string | undefined;
  /** Whether visualization is in progress */
  isLoading: boolean;
  /** Current visualization status */
  status: VisualizationStatus;
  /** Whether the Web Worker is available for large templates */
  workerAvailable: boolean;
  /** Process a template through the visualization pipeline */
  visualize: (template: string) => void;
  /** Reset visualization state to initial */
  reset: () => void;
}

// =============================================================================
// Synchronous Processing
// =============================================================================

/**
 * Process template synchronously on the main thread.
 */
function processTemplateSync(template: string): ProcessResult {
  try {
    const parseResult = parseTemplate(template);

    if (!parseResult.success) {
      return { success: false, error: parseResult.error };
    }

    const graphData = transformToGraph(parseResult.template);
    const layoutedGraph = layoutGraph(graphData.nodes, graphData.edges);

    return {
      success: true,
      nodes: layoutedGraph.nodes,
      edges: layoutedGraph.edges,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook to manage visualization state and processing.
 *
 * Combines parsing, graph transformation, and layout into a single
 * visualization pipeline with comprehensive state tracking.
 *
 * For large templates (50k+ characters by default), processing is automatically
 * offloaded to a Web Worker to prevent UI blocking.
 *
 * States flow:
 * - Sync: idle -> parsing -> transforming -> layouting -> complete | error
 * - Worker: idle -> processing -> complete | error
 *
 * @param options - Configuration options
 * @returns Visualization state and control functions
 *
 * @example
 * ```tsx
 * function GraphView() {
 *   const { nodes, edges, error, isLoading, visualize, reset } = useVisualization();
 *
 *   const handleVisualize = () => {
 *     visualize(templateInput);
 *   };
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <Alert>{error}</Alert>;
 *
 *   return <Graph nodes={nodes} edges={edges} />;
 * }
 * ```
 */
export function useVisualization(
  options: UseVisualizationOptions = {}
): UseVisualizationReturn {
  const {
    forceSync = false,
    workerThreshold = WORKER_THRESHOLD_CHARS,
  } = options;

  const [state, dispatch] = useReducer(visualizationReducer, initialState);
  const {
    isAvailable: workerAvailable,
    processTemplate: workerProcess,
  } = useTemplateWorker();

  // Track if component is mounted (for async operations)
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const visualize = useCallback((template: string) => {
    const shouldUseWorker =
      !forceSync &&
      workerAvailable &&
      template.length > workerThreshold;

    if (shouldUseWorker) {
      // Use worker for large templates
      dispatch({ type: "START_PROCESSING" });

      workerProcess(template).then((result) => {
        // Check if component is still mounted
        if (!isMountedRef.current) return;

        if (result.success) {
          dispatch({
            type: "COMPLETE",
            nodes: result.nodes,
            edges: result.edges,
          });
        } else {
          dispatch({ type: "ERROR", error: result.error });
        }
      });
    } else {
      // Use synchronous processing for small templates
      dispatch({ type: "START_PARSING" });

      try {
        const parseResult = parseTemplate(template);

        if (!parseResult.success) {
          dispatch({ type: "ERROR", error: parseResult.error });
          return;
        }

        dispatch({ type: "START_TRANSFORMING" });
        const graphData = transformToGraph(parseResult.template);

        dispatch({ type: "START_LAYOUTING" });
        const layoutedGraph = layoutGraph(graphData.nodes, graphData.edges);

        dispatch({
          type: "COMPLETE",
          nodes: layoutedGraph.nodes,
          edges: layoutedGraph.edges,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred";
        dispatch({ type: "ERROR", error: message });
      }
    }
  }, [forceSync, workerAvailable, workerThreshold, workerProcess]);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  // Derive isLoading from status
  const isLoading =
    state.status === "parsing" ||
    state.status === "transforming" ||
    state.status === "layouting" ||
    state.status === "processing";

  return {
    nodes: state.nodes,
    edges: state.edges,
    error: state.error,
    isLoading,
    status: state.status,
    workerAvailable,
    visualize,
    reset,
  };
}

// =============================================================================
// Standalone Processing Function (for non-React contexts)
// =============================================================================

/**
 * Process a template synchronously without using React hooks.
 * Useful for testing or server-side rendering scenarios.
 *
 * @param template - The CloudFormation template string
 * @returns Processing result with nodes/edges or error
 */
export { processTemplateSync };
