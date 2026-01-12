/**
 * GraphStatsPanel Stories
 */

import type { Meta, StoryObj } from '@storybook/react-vite'
import { GraphStatsPanel } from './GraphStatsPanel'

const meta = {
  title: 'Molecules/GraphStatsPanel',
  component: GraphStatsPanel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    compact: {
      control: 'boolean',
      description: 'Use compact layout for smaller displays',
    },
  },
} satisfies Meta<typeof GraphStatsPanel>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Simple graph with no cycles
 */
export const SimpleGraph: Story = {
  args: {
    metrics: {
      totalResources: 10,
      totalDependencies: 8,
      maxDepth: 3,
      resourcesByService: new Map([
        ['Lambda', 3],
        ['S3', 2],
        ['DynamoDB', 2],
        ['SNS', 1],
        ['SQS', 1],
        ['IAM', 1],
      ]),
      leafNodes: 4,
      rootNodes: 2,
      hasCycles: false,
    },
    compact: false,
  },
}

/**
 * Complex graph with cycles
 */
export const ComplexGraphWithCycles: Story = {
  args: {
    metrics: {
      totalResources: 25,
      totalDependencies: 30,
      maxDepth: 5,
      resourcesByService: new Map([
        ['Lambda', 8],
        ['DynamoDB', 4],
        ['S3', 3],
        ['API Gateway', 2],
        ['SNS', 2],
        ['SQS', 2],
        ['IAM', 2],
        ['CloudWatch', 1],
        ['EventBridge', 1],
      ]),
      leafNodes: 6,
      rootNodes: 3,
      hasCycles: true,
    },
    compact: false,
  },
}

/**
 * Small graph (single service)
 */
export const SmallGraph: Story = {
  args: {
    metrics: {
      totalResources: 3,
      totalDependencies: 2,
      maxDepth: 2,
      resourcesByService: new Map([['Lambda', 3]]),
      leafNodes: 1,
      rootNodes: 1,
      hasCycles: false,
    },
    compact: false,
  },
}

/**
 * Large enterprise graph
 */
export const LargeGraph: Story = {
  args: {
    metrics: {
      totalResources: 150,
      totalDependencies: 200,
      maxDepth: 8,
      resourcesByService: new Map([
        ['Lambda', 40],
        ['DynamoDB', 25],
        ['S3', 20],
        ['API Gateway', 15],
        ['SNS', 12],
        ['SQS', 10],
        ['IAM', 10],
        ['CloudWatch', 8],
        ['EventBridge', 5],
        ['Step Functions', 3],
        ['Cognito', 2],
      ]),
      leafNodes: 30,
      rootNodes: 10,
      hasCycles: false,
    },
    compact: false,
  },
}

/**
 * Compact layout for sidebars
 */
export const CompactLayout: Story = {
  args: {
    metrics: {
      totalResources: 15,
      totalDependencies: 12,
      maxDepth: 4,
      resourcesByService: new Map([
        ['Lambda', 5],
        ['S3', 3],
        ['DynamoDB', 3],
        ['SNS', 2],
        ['IAM', 2],
      ]),
      leafNodes: 5,
      rootNodes: 3,
      hasCycles: false,
    },
    compact: true,
  },
}

/**
 * Empty graph
 */
export const EmptyGraph: Story = {
  args: {
    metrics: {
      totalResources: 0,
      totalDependencies: 0,
      maxDepth: 0,
      resourcesByService: new Map(),
      leafNodes: 0,
      rootNodes: 0,
      hasCycles: false,
    },
    compact: false,
  },
}

/**
 * Graph with circular dependencies warning
 */
export const CircularDependencies: Story = {
  args: {
    metrics: {
      totalResources: 12,
      totalDependencies: 15,
      maxDepth: 4,
      resourcesByService: new Map([
        ['Lambda', 4],
        ['DynamoDB', 3],
        ['S3', 2],
        ['SNS', 2],
        ['IAM', 1],
      ]),
      leafNodes: 3,
      rootNodes: 2,
      hasCycles: true,
    },
    compact: false,
  },
}
