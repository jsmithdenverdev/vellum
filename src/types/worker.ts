/**
 * Web Worker Type Definitions
 *
 * Type definitions for communication between main thread and template processor worker.
 */

import type { CfnNode, CfnEdge } from "./graph";

// =============================================================================
// Worker Message Types
// =============================================================================

/**
 * Message sent to the worker to process a template
 */
export interface WorkerRequest {
  type: "PROCESS_TEMPLATE";
  id: string;
  payload: {
    templateString: string;
  };
}

/**
 * Successful result from the worker
 */
export interface WorkerSuccessResponse {
  type: "SUCCESS";
  id: string;
  payload: {
    nodes: CfnNode[];
    edges: CfnEdge[];
  };
}

/**
 * Error result from the worker
 */
export interface WorkerErrorResponse {
  type: "ERROR";
  id: string;
  payload: {
    error: string;
  };
}

/**
 * Union type for all worker responses
 */
export type WorkerResponse = WorkerSuccessResponse | WorkerErrorResponse;

// =============================================================================
// Hook Result Types
// =============================================================================

/**
 * Successful processing result
 */
export interface ProcessSuccess {
  success: true;
  nodes: CfnNode[];
  edges: CfnEdge[];
}

/**
 * Failed processing result
 */
export interface ProcessFailure {
  success: false;
  error: string;
}

/**
 * Discriminated union for processing results
 */
export type ProcessResult = ProcessSuccess | ProcessFailure;

/**
 * State returned by the useTemplateWorker hook
 */
export interface UseTemplateWorkerState {
  /** Whether the worker is currently processing a template */
  isProcessing: boolean;
  /** Whether the worker is available (supported and initialized) */
  isAvailable: boolean;
  /** Process a template string, returns nodes and edges or error */
  processTemplate: (templateString: string) => Promise<ProcessResult>;
}
