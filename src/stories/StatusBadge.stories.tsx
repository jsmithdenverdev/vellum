/**
 * StatusBadge Stories
 *
 * Demonstrates the StatusBadge atom component that displays resource status
 * indicators using Cloudscape StatusIndicator.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatusBadge } from "@/components/atoms/StatusBadge";

const meta = {
  title: "Atoms/StatusBadge",
  component: StatusBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: ["active", "pending", "error"],
      description: "Status type to display",
    },
    label: {
      control: "text",
      description: "Optional custom label (defaults based on status)",
    },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Active status - indicates a successful or running state.
 * Uses success indicator with green styling.
 */
export const Active: Story = {
  args: {
    status: "active",
  },
};

/**
 * Pending status - indicates an in-progress or waiting state.
 * Uses pending indicator with blue styling.
 */
export const Pending: Story = {
  args: {
    status: "pending",
  },
};

/**
 * Error status - indicates a failure or problem state.
 * Uses error indicator with red styling.
 */
export const Error: Story = {
  args: {
    status: "error",
  },
};

/**
 * Active status with custom label.
 */
export const ActiveWithCustomLabel: Story = {
  args: {
    status: "active",
    label: "Deployed",
  },
};

/**
 * Pending status with custom label.
 */
export const PendingWithCustomLabel: Story = {
  args: {
    status: "pending",
    label: "Deploying...",
  },
};

/**
 * Error status with custom label.
 */
export const ErrorWithCustomLabel: Story = {
  args: {
    status: "error",
    label: "Failed to deploy",
  },
};

/**
 * All status types displayed together for comparison.
 */
export const AllStatuses: Story = {
  args: {
    status: "active",
  },
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <StatusBadge status="active" />
      <StatusBadge status="pending" />
      <StatusBadge status="error" />
    </div>
  ),
};

/**
 * Status badges in a deployment scenario context.
 */
export const DeploymentScenario: Story = {
  args: {
    status: "active",
  },
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", width: "300px" }}>
        <span>Lambda Function</span>
        <StatusBadge status="active" label="Deployed" />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", width: "300px" }}>
        <span>S3 Bucket</span>
        <StatusBadge status="pending" label="Creating" />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", width: "300px" }}>
        <span>DynamoDB Table</span>
        <StatusBadge status="error" label="Rollback" />
      </div>
    </div>
  ),
};
