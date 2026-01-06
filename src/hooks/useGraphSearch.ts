/**
 * useGraphSearch Hook
 *
 * Provides search and filter functionality for CloudFormation graph nodes.
 * Supports searching by logical ID (partial match, case-insensitive)
 * and filtering by AWS service type.
 */

import { useState, useMemo, useCallback } from "react";

import type { CfnNode } from "@/types/graph";

// =============================================================================
// Types
// =============================================================================

/**
 * Filter option representing a unique AWS service type
 */
export interface ServiceFilterOption {
  /** The display label (e.g., "Lambda") */
  label: string;
  /** The full resource type prefix (e.g., "AWS::Lambda") */
  value: string;
}

/**
 * Return type for the useGraphSearch hook
 */
export interface UseGraphSearchReturn {
  /** Current search term */
  searchTerm: string;
  /** Set the search term */
  setSearchTerm: (term: string) => void;
  /** Currently selected service type filters */
  selectedServiceTypes: string[];
  /** Set the selected service type filters */
  setSelectedServiceTypes: (types: string[]) => void;
  /** Available service types derived from nodes */
  availableServiceTypes: ServiceFilterOption[];
  /** IDs of nodes that match the current search/filter criteria */
  matchingNodeIds: Set<string>;
  /** Whether search/filter is currently active */
  isSearchActive: boolean;
  /** Clear all search and filter criteria */
  clearSearch: () => void;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Extracts the AWS service name from a resource type
 * e.g., "AWS::Lambda::Function" -> { label: "Lambda", value: "AWS::Lambda" }
 */
function extractServiceInfo(resourceType: string): ServiceFilterOption | null {
  const parts = resourceType.split("::");
  if (parts.length >= 2 && parts[0] === "AWS") {
    return {
      label: parts[1],
      value: `AWS::${parts[1]}`,
    };
  }
  return null;
}

/**
 * Gets unique service types from an array of nodes
 */
function getUniqueServiceTypes(nodes: CfnNode[]): ServiceFilterOption[] {
  const serviceMap = new Map<string, ServiceFilterOption>();

  for (const node of nodes) {
    const serviceInfo = extractServiceInfo(node.data.resourceType);
    if (serviceInfo && !serviceMap.has(serviceInfo.value)) {
      serviceMap.set(serviceInfo.value, serviceInfo);
    }
  }

  // Sort alphabetically by label
  return Array.from(serviceMap.values()).sort((a, b) =>
    a.label.localeCompare(b.label)
  );
}

/**
 * Checks if a node matches the search term (case-insensitive, partial match)
 */
function matchesSearchTerm(node: CfnNode, searchTerm: string): boolean {
  if (!searchTerm.trim()) return true;

  const normalizedSearch = searchTerm.toLowerCase().trim();
  const logicalId = node.data.logicalId.toLowerCase();
  const resourceType = node.data.resourceType.toLowerCase();

  return (
    logicalId.includes(normalizedSearch) ||
    resourceType.includes(normalizedSearch)
  );
}

/**
 * Checks if a node matches any of the selected service type filters
 */
function matchesServiceFilter(
  node: CfnNode,
  selectedServiceTypes: string[]
): boolean {
  if (selectedServiceTypes.length === 0) return true;

  return selectedServiceTypes.some((serviceType) =>
    node.data.resourceType.startsWith(serviceType)
  );
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook for searching and filtering CloudFormation graph nodes.
 *
 * @param nodes - Array of CfnNode objects to search/filter
 * @returns Search state and methods
 *
 * @example
 * ```tsx
 * const { searchTerm, setSearchTerm, matchingNodeIds, isSearchActive } = useGraphSearch(nodes);
 *
 * // Highlight matching nodes in the graph
 * const getNodeStyle = (nodeId: string) => ({
 *   opacity: isSearchActive && !matchingNodeIds.has(nodeId) ? 0.3 : 1,
 * });
 * ```
 */
export function useGraphSearch(nodes: CfnNode[]): UseGraphSearchReturn {
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>(
    []
  );

  // Compute available service types from nodes
  const availableServiceTypes = useMemo(
    () => getUniqueServiceTypes(nodes),
    [nodes]
  );

  // Compute matching node IDs based on current search/filter criteria
  const matchingNodeIds = useMemo(() => {
    const matching = new Set<string>();

    for (const node of nodes) {
      const matchesSearch = matchesSearchTerm(node, searchTerm);
      const matchesFilter = matchesServiceFilter(node, selectedServiceTypes);

      if (matchesSearch && matchesFilter) {
        matching.add(node.id);
      }
    }

    return matching;
  }, [nodes, searchTerm, selectedServiceTypes]);

  // Determine if search is active (any criteria applied)
  const isSearchActive = useMemo(
    () => searchTerm.trim().length > 0 || selectedServiceTypes.length > 0,
    [searchTerm, selectedServiceTypes]
  );

  // Clear all search and filter criteria
  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setSelectedServiceTypes([]);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    selectedServiceTypes,
    setSelectedServiceTypes,
    availableServiceTypes,
    matchingNodeIds,
    isSearchActive,
    clearSearch,
  };
}
