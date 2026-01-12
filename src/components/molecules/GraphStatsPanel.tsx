/**
 * GraphStatsPanel Component
 *
 * Displays graph analytics and statistics in a compact panel.
 * Shows resource counts, dependency metrics, and service breakdown.
 */

import Box from '@cloudscape-design/components/box'
import ColumnLayout from '@cloudscape-design/components/column-layout'
import Container from '@cloudscape-design/components/container'
import Header from '@cloudscape-design/components/header'
import SpaceBetween from '@cloudscape-design/components/space-between'
import Badge from '@cloudscape-design/components/badge'

import type { GraphMetrics } from '@/lib/graph-analytics'

// =============================================================================
// Types
// =============================================================================

export interface GraphStatsPanelProps {
  /** Graph metrics to display */
  metrics: GraphMetrics
  /** Whether to show in compact mode */
  compact?: boolean
}

// =============================================================================
// Helper Components
// =============================================================================

/**
 * Stat item component for displaying a metric
 */
interface StatItemProps {
  label: string
  value: string | number
  variant?: 'default' | 'warning' | 'success'
}

function StatItem({ label, value, variant = 'default' }: StatItemProps) {
  const getColor = () => {
    switch (variant) {
      case 'warning':
        return 'text-status-warning'
      case 'success':
        return 'text-status-success'
      default:
        return 'text-body-secondary'
    }
  }

  return (
    <div>
      <Box variant="awsui-key-label" color={getColor()}>
        {label}
      </Box>
      <Box variant="h3" fontWeight="bold">
        {value}
      </Box>
    </div>
  )
}

/**
 * Service breakdown component
 */
interface ServiceBreakdownProps {
  resourcesByService: Map<string, number>
  totalResources: number
}

function ServiceBreakdown({ resourcesByService, totalResources }: ServiceBreakdownProps) {
  // Sort services by count (descending)
  const sortedServices = Array.from(resourcesByService.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5) // Show top 5 services

  if (sortedServices.length === 0) {
    return (
      <Box variant="p" color="text-body-secondary">
        No resources
      </Box>
    )
  }

  return (
    <SpaceBetween direction="vertical" size="xs">
      {sortedServices.map(([service, count]) => {
        const percentage = Math.round((count / totalResources) * 100)
        return (
          <div
            key={service}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box variant="span" fontSize="body-s">
              {service}
            </Box>
            <SpaceBetween direction="horizontal" size="xs" alignItems="center">
              <Box variant="span" fontSize="body-s" color="text-body-secondary">
                {count} ({percentage}%)
              </Box>
            </SpaceBetween>
          </div>
        )
      })}
      {resourcesByService.size > 5 && (
        <Box variant="small" color="text-body-secondary">
          +{resourcesByService.size - 5} more services
        </Box>
      )}
    </SpaceBetween>
  )
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * Panel displaying graph statistics and analytics
 */
export function GraphStatsPanel({ metrics, compact = false }: GraphStatsPanelProps) {
  const {
    totalResources,
    totalDependencies,
    maxDepth,
    resourcesByService,
    leafNodes,
    rootNodes,
    hasCycles,
  } = metrics

  // Calculate average dependencies per resource
  const avgDependencies = totalResources > 0 ? (totalDependencies / totalResources).toFixed(1) : '0'

  return (
    <Container
      header={
        <Header variant="h3" description={compact ? undefined : 'Resource graph analytics'}>
          Graph Statistics
        </Header>
      }
    >
      <SpaceBetween direction="vertical" size="l">
        {/* Overview metrics */}
        <ColumnLayout columns={compact ? 2 : 3} variant="text-grid">
          <StatItem label="Total Resources" value={totalResources} />
          <StatItem label="Dependencies" value={totalDependencies} />
          <StatItem label="Max Depth" value={maxDepth} />
          {!compact && (
            <>
              <StatItem label="Avg Dependencies" value={avgDependencies} />
              <StatItem label="Leaf Nodes" value={leafNodes} />
              <StatItem label="Root Nodes" value={rootNodes} />
            </>
          )}
        </ColumnLayout>

        {/* Cycle detection warning */}
        {hasCycles && (
          <Box>
            <Badge color="red">Circular Dependencies Detected</Badge>
            <Box variant="small" color="text-status-error" margin={{ top: 'xxs' }}>
              The template contains circular dependencies which may cause deployment issues.
            </Box>
          </Box>
        )}

        {/* Service breakdown */}
        {!compact && resourcesByService.size > 0 && (
          <div>
            <Box variant="h4" margin={{ bottom: 'xs' }}>
              Top Services
            </Box>
            <ServiceBreakdown
              resourcesByService={resourcesByService}
              totalResources={totalResources}
            />
          </div>
        )}
      </SpaceBetween>
    </Container>
  )
}
