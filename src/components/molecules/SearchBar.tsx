/**
 * SearchBar Component
 *
 * Search and filter bar for CloudFormation graph nodes.
 * Uses Cloudscape Input with search icon and Multiselect for service type filtering.
 */

import { useMemo, useCallback } from "react";
import Input from "@cloudscape-design/components/input";
import Multiselect from "@cloudscape-design/components/multiselect";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";

import type { MultiselectProps } from "@cloudscape-design/components/multiselect";

import type { CfnNode } from "@/types/graph";
import type { ServiceFilterOption } from "@/hooks/useGraphSearch";

// =============================================================================
// Types
// =============================================================================

export interface SearchBarProps {
  /** Current search term */
  searchTerm: string;
  /** Callback when search term changes */
  onSearchChange: (term: string) => void;
  /** Currently selected service type values */
  selectedServiceTypes: string[];
  /** Callback when selected service types change */
  onFilterChange: (types: string[]) => void;
  /** Available service type filter options */
  availableServiceTypes: ServiceFilterOption[];
  /** Callback to clear all search/filter criteria */
  onClear: () => void;
  /** Whether search/filter is currently active */
  isSearchActive: boolean;
  /** Number of matching results */
  matchCount: number;
  /** Total number of nodes */
  totalCount: number;
  /** Callback to zoom to first matching node */
  onZoomToMatch?: () => void;
  /** All nodes for deriving filter options - optional, used if availableServiceTypes not provided */
  nodes?: CfnNode[];
}

// =============================================================================
// Styles
// =============================================================================

const containerStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 12px",
  backgroundColor: "var(--color-background-container-content)",
  borderRadius: "8px",
  boxShadow: "0 1px 4px rgba(0, 0, 0, 0.15)",
};

const searchInputStyles: React.CSSProperties = {
  width: "200px",
  flexShrink: 0,
};

const filterSelectStyles: React.CSSProperties = {
  width: "200px",
  flexShrink: 0,
};

const matchCountStyles: React.CSSProperties = {
  fontSize: "12px",
  color: "var(--color-text-body-secondary, #5f6b7a)",
  whiteSpace: "nowrap",
  marginLeft: "4px",
};

// =============================================================================
// Component
// =============================================================================

/**
 * Search and filter bar for CloudFormation graph nodes.
 * Provides text search by logical ID and multiselect filter by AWS service type.
 *
 * @example
 * ```tsx
 * <SearchBar
 *   searchTerm={searchTerm}
 *   onSearchChange={setSearchTerm}
 *   selectedServiceTypes={selectedTypes}
 *   onFilterChange={setSelectedTypes}
 *   availableServiceTypes={serviceTypes}
 *   onClear={clearSearch}
 *   isSearchActive={isActive}
 *   matchCount={matchingIds.size}
 *   totalCount={nodes.length}
 * />
 * ```
 */
export function SearchBar({
  searchTerm,
  onSearchChange,
  selectedServiceTypes,
  onFilterChange,
  availableServiceTypes,
  onClear,
  isSearchActive,
  matchCount,
  totalCount,
  onZoomToMatch,
}: SearchBarProps) {
  // Convert service types to Cloudscape Multiselect options
  const filterOptions: MultiselectProps.Option[] = useMemo(
    () =>
      availableServiceTypes.map((service) => ({
        label: service.label,
        value: service.value,
      })),
    [availableServiceTypes]
  );

  // Convert selected values to Cloudscape selected options format
  const selectedOptions: MultiselectProps.Option[] = useMemo(
    () =>
      selectedServiceTypes.map((value) => {
        const option = availableServiceTypes.find((s) => s.value === value);
        return {
          label: option?.label ?? value,
          value,
        };
      }),
    [selectedServiceTypes, availableServiceTypes]
  );

  // Handle search input change
  const handleSearchChange = useCallback(
    (event: { detail: { value: string } }) => {
      onSearchChange(event.detail.value);
    },
    [onSearchChange]
  );

  // Handle filter selection change
  const handleFilterChange = useCallback(
    (event: { detail: { selectedOptions: readonly MultiselectProps.Option[] } }) => {
      const values = event.detail.selectedOptions
        .map((opt) => opt.value)
        .filter((v): v is string => v !== undefined);
      onFilterChange(values);
    },
    [onFilterChange]
  );

  // Render match count text
  const matchCountText = useMemo(() => {
    if (!isSearchActive) return null;
    return `${matchCount} of ${totalCount} resources`;
  }, [isSearchActive, matchCount, totalCount]);

  return (
    <div style={containerStyles}>
      <div style={searchInputStyles}>
        <Input
          type="search"
          placeholder="Search resources..."
          value={searchTerm}
          onChange={handleSearchChange}
          ariaLabel="Search resources by name or type"
        />
      </div>

      <div style={filterSelectStyles}>
        <Multiselect
          placeholder="Filter by service"
          options={filterOptions}
          selectedOptions={selectedOptions}
          onChange={handleFilterChange}
          filteringType="auto"
          tokenLimit={0}
          hideTokens={true}
          ariaLabel="Filter by AWS service type"
        />
      </div>

      {selectedServiceTypes.length > 0 && (
        <span style={matchCountStyles}>
          {selectedServiceTypes.length} filter{selectedServiceTypes.length > 1 ? "s" : ""}
        </span>
      )}

      <SpaceBetween direction="horizontal" size="xs" alignItems="center">
        {matchCountText && <span style={matchCountStyles}>{matchCountText}</span>}

        {isSearchActive && onZoomToMatch && matchCount > 0 && (
          <Button
            iconName="search"
            variant="icon"
            onClick={onZoomToMatch}
            ariaLabel="Zoom to first matching node"
          />
        )}

        {isSearchActive && (
          <Button
            iconName="close"
            variant="icon"
            onClick={onClear}
            ariaLabel="Clear search and filters"
          />
        )}
      </SpaceBetween>
    </div>
  );
}
