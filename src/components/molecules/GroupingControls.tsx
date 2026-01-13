/**
 * GroupingControls Component
 *
 * UI controls for toggling and configuring resource grouping.
 */

import Button from '@cloudscape-design/components/button'
import SpaceBetween from '@cloudscape-design/components/space-between'
import Badge from '@cloudscape-design/components/badge'
import Popover from '@cloudscape-design/components/popover'
import StatusIndicator from '@cloudscape-design/components/status-indicator'

// =============================================================================
// Types
// =============================================================================

export interface GroupingControlsProps {
  /** Whether grouping is currently enabled */
  isGroupingEnabled: boolean
  /** Number of active groups */
  groupCount: number
  /** Toggle grouping on/off */
  onToggle: () => void
  /** Whether the graph has any nodes */
  hasNodes?: boolean
}

// =============================================================================
// Component
// =============================================================================

/**
 * Controls for managing resource grouping in the graph.
 *
 * @example
 * ```tsx
 * <GroupingControls
 *   isGroupingEnabled={isGroupingEnabled}
 *   groupCount={groups.length}
 *   onToggle={toggleGrouping}
 *   hasNodes={nodes.length > 0}
 * />
 * ```
 */
export function GroupingControls({
  isGroupingEnabled,
  groupCount,
  onToggle,
  hasNodes = true,
}: GroupingControlsProps) {
  // Don't show controls if there are no nodes
  if (!hasNodes) {
    return null
  }

  return (
    <SpaceBetween direction="horizontal" size="xs" alignItems="center">
      <Button
        iconName={isGroupingEnabled ? 'view-vertical' : 'view-horizontal'}
        variant="icon"
        onClick={onToggle}
        ariaLabel={isGroupingEnabled ? 'Disable grouping' : 'Enable grouping'}
        disabled={!hasNodes}
      />
      {isGroupingEnabled && groupCount > 0 && (
        <Popover
          dismissButton={false}
          position="bottom"
          size="small"
          triggerType="custom"
          content={
            <StatusIndicator type="success">
              Resources grouped by {groupCount} service{groupCount !== 1 ? 's' : ''}
            </StatusIndicator>
          }
        >
          <Badge color="green">{groupCount}</Badge>
        </Popover>
      )}
    </SpaceBetween>
  )
}
