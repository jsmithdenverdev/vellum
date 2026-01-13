/**
 * GroupingControls Stories
 */

import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { GroupingControls } from './GroupingControls'

const meta = {
  title: 'Molecules/GroupingControls',
  component: GroupingControls,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isGroupingEnabled: {
      control: 'boolean',
      description: 'Whether grouping is currently enabled',
    },
    groupCount: {
      control: 'number',
      description: 'Number of active groups',
    },
    hasNodes: {
      control: 'boolean',
      description: 'Whether the graph has any nodes',
    },
  },
  args: {
    onToggle: fn(),
  },
} satisfies Meta<typeof GroupingControls>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default state with grouping disabled
 */
export const Disabled: Story = {
  args: {
    isGroupingEnabled: false,
    groupCount: 0,
    hasNodes: true,
  },
}

/**
 * Grouping enabled with multiple groups
 */
export const EnabledWithGroups: Story = {
  args: {
    isGroupingEnabled: true,
    groupCount: 5,
    hasNodes: true,
  },
}

/**
 * Grouping enabled with single group
 */
export const EnabledSingleGroup: Story = {
  args: {
    isGroupingEnabled: true,
    groupCount: 1,
    hasNodes: true,
  },
}

/**
 * No nodes in graph (controls hidden)
 */
export const NoNodes: Story = {
  args: {
    isGroupingEnabled: false,
    groupCount: 0,
    hasNodes: false,
  },
}
