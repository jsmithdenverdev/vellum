/**
 * SearchBar Stories
 *
 * Demonstrates the SearchBar molecule component that provides search and filter
 * functionality for CloudFormation graph nodes.
 */

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { SearchBar } from "@/components/molecules/SearchBar";

import type { ServiceFilterOption } from "@/hooks/useGraphSearch";

// Sample service filter options
const sampleServiceTypes: ServiceFilterOption[] = [
  { label: "Lambda Function", value: "AWS::Lambda::Function" },
  { label: "S3 Bucket", value: "AWS::S3::Bucket" },
  { label: "DynamoDB Table", value: "AWS::DynamoDB::Table" },
  { label: "IAM Role", value: "AWS::IAM::Role" },
  { label: "SQS Queue", value: "AWS::SQS::Queue" },
  { label: "SNS Topic", value: "AWS::SNS::Topic" },
];

const meta = {
  title: "Molecules/SearchBar",
  component: SearchBar,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    searchTerm: {
      control: "text",
      description: "Current search term",
    },
    selectedServiceTypes: {
      control: "object",
      description: "Currently selected service type values",
    },
    isSearchActive: {
      control: "boolean",
      description: "Whether search/filter is currently active",
    },
    matchCount: {
      control: "number",
      description: "Number of matching results",
    },
    totalCount: {
      control: "number",
      description: "Total number of nodes",
    },
  },
  args: {
    onSearchChange: fn(),
    onFilterChange: fn(),
    onClear: fn(),
    onZoomToMatch: fn(),
  },
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Empty state - no search or filters applied.
 * Shows the default search input and filter dropdown.
 */
export const EmptyState: Story = {
  args: {
    searchTerm: "",
    selectedServiceTypes: [],
    availableServiceTypes: sampleServiceTypes,
    isSearchActive: false,
    matchCount: 0,
    totalCount: 13,
  },
};

/**
 * With search term - active text search showing match count.
 */
export const WithSearchTerm: Story = {
  args: {
    searchTerm: "Lambda",
    selectedServiceTypes: [],
    availableServiceTypes: sampleServiceTypes,
    isSearchActive: true,
    matchCount: 3,
    totalCount: 13,
  },
};

/**
 * With filter selected - active service type filter.
 */
export const WithFilter: Story = {
  args: {
    searchTerm: "",
    selectedServiceTypes: ["AWS::Lambda::Function"],
    availableServiceTypes: sampleServiceTypes,
    isSearchActive: true,
    matchCount: 3,
    totalCount: 13,
  },
};

/**
 * Multiple filters selected - multiple service types filtered.
 */
export const MultipleFilters: Story = {
  args: {
    searchTerm: "",
    selectedServiceTypes: ["AWS::Lambda::Function", "AWS::S3::Bucket", "AWS::DynamoDB::Table"],
    availableServiceTypes: sampleServiceTypes,
    isSearchActive: true,
    matchCount: 6,
    totalCount: 13,
  },
};

/**
 * Combined search and filter - both text search and filter active.
 */
export const CombinedSearchAndFilter: Story = {
  args: {
    searchTerm: "Order",
    selectedServiceTypes: ["AWS::Lambda::Function", "AWS::DynamoDB::Table"],
    availableServiceTypes: sampleServiceTypes,
    isSearchActive: true,
    matchCount: 2,
    totalCount: 13,
  },
};

/**
 * No matches found - search returns zero results.
 */
export const NoMatches: Story = {
  args: {
    searchTerm: "NonExistent",
    selectedServiceTypes: [],
    availableServiceTypes: sampleServiceTypes,
    isSearchActive: true,
    matchCount: 0,
    totalCount: 13,
  },
};

/**
 * All matches - filter/search matches all resources.
 */
export const AllMatches: Story = {
  args: {
    searchTerm: "",
    selectedServiceTypes: [],
    availableServiceTypes: sampleServiceTypes,
    isSearchActive: true,
    matchCount: 13,
    totalCount: 13,
  },
};

/**
 * Interactive example - demonstrates the full interaction flow.
 */
export const Interactive: Story = {
  args: {
    searchTerm: "",
    selectedServiceTypes: [],
    availableServiceTypes: sampleServiceTypes,
    isSearchActive: false,
    matchCount: 0,
    totalCount: 13,
  },
  render: function InteractiveSearchBar() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

    const isActive = searchTerm.length > 0 || selectedTypes.length > 0;

    // Simulate match counting
    const matchCount = isActive
      ? Math.max(1, Math.floor(13 - searchTerm.length - selectedTypes.length * 2))
      : 0;

    const handleClear = () => {
      setSearchTerm("");
      setSelectedTypes([]);
    };

    return (
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedServiceTypes={selectedTypes}
        onFilterChange={setSelectedTypes}
        availableServiceTypes={sampleServiceTypes}
        onClear={handleClear}
        isSearchActive={isActive}
        matchCount={matchCount}
        totalCount={13}
        onZoomToMatch={() => console.log("Zoom to match clicked")}
      />
    );
  },
};

/**
 * Without zoom button - when onZoomToMatch is not provided.
 */
export const WithoutZoomButton: Story = {
  args: {
    searchTerm: "Lambda",
    selectedServiceTypes: [],
    availableServiceTypes: sampleServiceTypes,
    isSearchActive: true,
    matchCount: 3,
    totalCount: 13,
    onZoomToMatch: undefined,
  },
};

/**
 * Large template - many service types available.
 */
export const LargeTemplate: Story = {
  args: {
    searchTerm: "",
    selectedServiceTypes: [],
    availableServiceTypes: [
      ...sampleServiceTypes,
      { label: "API Gateway", value: "AWS::ApiGateway::RestApi" },
      { label: "Step Functions", value: "AWS::StepFunctions::StateMachine" },
      { label: "CloudWatch Alarm", value: "AWS::CloudWatch::Alarm" },
      { label: "EventBridge Rule", value: "AWS::Events::Rule" },
      { label: "Secrets Manager", value: "AWS::SecretsManager::Secret" },
      { label: "KMS Key", value: "AWS::KMS::Key" },
    ],
    isSearchActive: false,
    matchCount: 0,
    totalCount: 27,
  },
};
