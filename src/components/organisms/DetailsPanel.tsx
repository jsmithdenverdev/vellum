/**
 * DetailsPanel Component
 *
 * Right-side panel displaying details about a selected CloudFormation resource.
 * Opens on double-click of a node in the graph.
 */

import Box from "@cloudscape-design/components/box";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Container from "@cloudscape-design/components/container";
import ColumnLayout from "@cloudscape-design/components/column-layout";

import { getServiceInfo, getIconUrl, extractResourceName } from "@/lib/aws-icons";
import type { CfnNodeData } from "@/types/graph";

// =============================================================================
// Types
// =============================================================================

export interface DetailsPanelProps {
  /** The selected node data to display */
  nodeData: CfnNodeData | null;
}

// =============================================================================
// Styles
// =============================================================================

const iconContainerStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "64px",
  height: "64px",
  borderRadius: "8px",
  overflow: "hidden",
  backgroundColor: "#f2f3f3",
  flexShrink: 0,
};

const iconStyles: React.CSSProperties = {
  width: "64px",
  height: "64px",
  objectFit: "cover",
};

const headerContainerStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
};

// =============================================================================
// Component
// =============================================================================

/**
 * DetailsPanel displays information about a selected CloudFormation resource.
 */
export function DetailsPanel({ nodeData }: DetailsPanelProps) {
  if (!nodeData) {
    return (
      <Box padding="l" textAlign="center" color="text-body-secondary">
        <SpaceBetween direction="vertical" size="s">
          <Box variant="p">No resource selected</Box>
          <Box variant="small">Double-click a node to view details</Box>
        </SpaceBetween>
      </Box>
    );
  }

  const serviceInfo = getServiceInfo(nodeData.resourceType);
  const iconUrl = getIconUrl(nodeData.resourceType);
  const resourceName = extractResourceName(nodeData.resourceType);

  return (
    <Box padding="l">
      <SpaceBetween direction="vertical" size="l">
        {/* Resource Header */}
        <div style={headerContainerStyles}>
          {/* Icon */}
          <div style={iconContainerStyles}>
            {iconUrl ? (
              <img src={iconUrl} alt={serviceInfo.name} style={iconStyles} />
            ) : (
              <Box fontSize="heading-xl" fontWeight="bold" color="text-body-secondary">
                {serviceInfo.abbreviation}
              </Box>
            )}
          </div>

          {/* Title and type */}
          <SpaceBetween direction="vertical" size="xxs">
            <Box variant="small" color="text-body-secondary">
              {resourceName}
            </Box>
            <Box variant="h2">{nodeData.logicalId}</Box>
          </SpaceBetween>
        </div>

        {/* Resource Details */}
        <Container header={<Header variant="h3">Details</Header>}>
          <ColumnLayout columns={1} variant="text-grid">
            <SpaceBetween direction="vertical" size="xs">
              <Box variant="awsui-key-label">Logical ID</Box>
              <Box>{nodeData.logicalId}</Box>
            </SpaceBetween>

            <SpaceBetween direction="vertical" size="xs">
              <Box variant="awsui-key-label">Resource Type</Box>
              <code style={{ fontSize: "13px" }}>{nodeData.resourceType}</code>
            </SpaceBetween>

            <SpaceBetween direction="vertical" size="xs">
              <Box variant="awsui-key-label">Service</Box>
              <Box>{serviceInfo.name}</Box>
            </SpaceBetween>
          </ColumnLayout>
        </Container>
      </SpaceBetween>
    </Box>
  );
}
