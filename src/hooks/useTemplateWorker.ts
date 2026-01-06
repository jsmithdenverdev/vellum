/**
 * useTemplateWorker Hook
 *
 * Manages a Web Worker for offloading template processing to a background thread.
 * Provides promise-based interface for processing templates without blocking the UI.
 */

import { useCallback, useEffect, useRef, useState } from "react";

import type {
  WorkerRequest,
  WorkerResponse,
  ProcessResult,
  UseTemplateWorkerState,
} from "@/types/worker";

// =============================================================================
// Types
// =============================================================================

interface PendingRequest {
  resolve: (result: ProcessResult) => void;
  reject: (error: Error) => void;
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook to manage template processing in a Web Worker.
 *
 * The worker handles the full processing pipeline:
 * - JSON parsing
 * - CloudFormation validation
 * - Graph transformation
 * - Layout calculation
 *
 * @returns State and methods for worker-based template processing
 *
 * @example
 * ```tsx
 * const { isProcessing, isAvailable, processTemplate } = useTemplateWorker();
 *
 * const handleVisualize = async () => {
 *   const result = await processTemplate(templateInput);
 *   if (result.success) {
 *     setNodes(result.nodes);
 *     setEdges(result.edges);
 *   } else {
 *     setError(result.error);
 *   }
 * };
 * ```
 */
export function useTemplateWorker(): UseTemplateWorkerState {
  const workerRef = useRef<Worker | null>(null);
  const pendingRequestsRef = useRef<Map<string, PendingRequest>>(new Map());
  const requestIdRef = useRef(0);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  // Initialize the worker
  useEffect(() => {
    // Check if Web Workers are supported
    if (typeof Worker === "undefined") {
      console.warn("Web Workers are not supported in this environment");
      return;
    }

    let worker: Worker | null = null;

    try {
      // Create worker using Vite's built-in worker support
      // The URL constructor with import.meta.url allows Vite to bundle the worker
      worker = new Worker(
        new URL("../workers/template-processor.worker.ts", import.meta.url),
        { type: "module" }
      );

      // Handle messages from the worker
      worker.onmessage = (event: MessageEvent<WorkerResponse | { type: "READY" }>) => {
        const data = event.data;

        // Handle ready signal
        if (data.type === "READY") {
          setIsAvailable(true);
          return;
        }

        // Handle processing responses
        const response = data as WorkerResponse;
        const pending = pendingRequestsRef.current.get(response.id);

        if (!pending) {
          console.warn(`Received response for unknown request: ${response.id}`);
          return;
        }

        // Remove from pending
        pendingRequestsRef.current.delete(response.id);

        // Update processing state if no more pending requests
        if (pendingRequestsRef.current.size === 0) {
          setIsProcessing(false);
        }

        // Resolve the promise
        if (response.type === "SUCCESS") {
          pending.resolve({
            success: true,
            nodes: response.payload.nodes,
            edges: response.payload.edges,
          });
        } else {
          pending.resolve({
            success: false,
            error: response.payload.error,
          });
        }
      };

      // Handle worker errors
      worker.onerror = (error) => {
        console.error("Worker error:", error);

        // Reject all pending requests
        for (const [id, pending] of pendingRequestsRef.current) {
          pending.reject(new Error(`Worker error: ${error.message}`));
          pendingRequestsRef.current.delete(id);
        }

        setIsProcessing(false);
        setIsAvailable(false);
      };

      workerRef.current = worker;
    } catch (err) {
      console.error("Failed to create worker:", err);
      // Worker creation failed - will stay unavailable (initial state is false)
    }

    // Capture current pending requests for cleanup
    const currentPendingRequests = pendingRequestsRef.current;

    // Cleanup on unmount
    return () => {
      if (worker) {
        worker.terminate();
        workerRef.current = null;
      }

      // Reject any pending requests
      for (const pending of currentPendingRequests.values()) {
        pending.reject(new Error("Worker terminated"));
      }
      currentPendingRequests.clear();
    };
  }, []);

  // Process template function
  const processTemplate = useCallback(
    (templateString: string): Promise<ProcessResult> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          // Worker not available, return error
          resolve({
            success: false,
            error: "Worker not available",
          });
          return;
        }

        // Generate unique request ID
        const id = `req-${++requestIdRef.current}`;

        // Store pending request
        pendingRequestsRef.current.set(id, { resolve, reject });
        setIsProcessing(true);

        // Send message to worker
        const message: WorkerRequest = {
          type: "PROCESS_TEMPLATE",
          id,
          payload: {
            templateString,
          },
        };

        workerRef.current.postMessage(message);
      });
    },
    []
  );

  return {
    isProcessing,
    isAvailable,
    processTemplate,
  };
}
