/**
 * SearchBar Component
 *
 * Search and filter bar for CloudFormation graph nodes.
 * Uses a vertical layout with search input, filter dropdown, and status row.
 */

import { useMemo, useCallback } from "react";
import Input from "@cloudscape-design/components/input";
import Multiselect from "@cloudscape-design/components/multiselect";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Badge from "@cloudscape-design/components/badge";

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
  flexDirection: "column",
  gap: "8px",
  padding: "12px",
  backgroundColor: "var(--color-background-container-content)",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  width: "min(280px, calc(100vw - 100px))",
  maxWidth: "280px",
};

const statusRowStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: "32px",
};

const filterTagsStyles: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "4px",
  flex: 1,
  marginRight: "12px",
};

const matchCountStyles: React.CSSProperties = {
  fontSize: "12px",
  color: "var(--color-text-body-secondary, #5f6b7a)",
  whiteSpace: "nowrap",
};

// =============================================================================
// Component
// =============================================================================

/**
 * Search and filter bar for CloudFormation graph nodes.
 * Provides text search by logical ID and multiselect filter by AWS service type.
 * Uses a vertical layout to prevent layout shifts when filters are applied.
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

  // Get labels for selected filters
  const selectedFilterLabels = useMemo(
    () =>
      selectedServiceTypes.map((value) => {
        const option = availableServiceTypes.find((s) => s.value === value);
        return option?.label ?? value;
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

  // Remove a single filter
  const handleRemoveFilter = useCallback(
    (valueToRemove: string) => {
      onFilterChange(selectedServiceTypes.filter((v) => v !== valueToRemove));
    },
    [selectedServiceTypes, onFilterChange]
  );

  // Show status row if search is active or filters are selected
  const showStatusRow = isSearchActive || selectedServiceTypes.length > 0;

  return (
    <div style={containerStyles}>
      {/* Search input */}
      <Input
        type="search"
        placeholder="Search resources..."
        value={searchTerm}
        onChange={handleSearchChange}
        ariaLabel="Search resources by name or type"
      />

      {/* Filter dropdown */}
      <Multiselect
        placeholder="Filter by service type"
        options={filterOptions}
        selectedOptions={selectedOptions}
        onChange={handleFilterChange}
        filteringType="auto"
        tokenLimit={0}
        hideTokens={true}
        ariaLabel="Filter by AWS service type"
      />

      {/* Status row - filter tags, match count, and actions */}
      {showStatusRow && (
        <div style={statusRowStyles}>
          {/* Selected filter tags */}
          <div style={filterTagsStyles}>
            {selectedFilterLabels.map((label, index) => (
              <Badge
                key={selectedServiceTypes[index]}
                color="blue"
              >
                {label}
                <button
                  onClick={() => handleRemoveFilter(selectedServiceTypes[index])}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    marginLeft: "4px",
                    padding: "0 2px",
                    color: "inherit",
                    fontSize: "inherit",
                    lineHeight: 1,
                  }}
                  aria-label={`Remove ${label} filter`}
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>

          {/* Match count and actions */}
          <SpaceBetween direction="horizontal" size="xs" alignItems="center">
            {isSearchActive && (
              <span style={matchCountStyles}>
                {matchCount} of {totalCount}
              </span>
            )}

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
      )}
    </div>
  );
}
