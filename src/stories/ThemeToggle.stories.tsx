/**
 * ThemeToggle Stories
 *
 * Demonstrates the ThemeToggle atom component that provides
 * a manual dark/light mode toggle using Cloudscape Toggle.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeToggle } from "@/components/atoms/ThemeToggle";

const meta = {
  title: "Atoms/ThemeToggle",
  component: ThemeToggle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      description: "Optional label override (default: 'Dark mode')",
    },
  },
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default theme toggle with standard "Dark mode" label.
 * The toggle integrates with the ThemeContext to control app-wide theming.
 */
export const Default: Story = {
  args: {},
};

/**
 * Theme toggle with custom "Night mode" label.
 */
export const NightModeLabel: Story = {
  args: {
    label: "Night mode",
  },
};

/**
 * Theme toggle with custom "Enable dark theme" label.
 */
export const EnableDarkTheme: Story = {
  args: {
    label: "Enable dark theme",
  },
};

/**
 * Theme toggle in a settings panel context.
 */
export const InSettingsPanel: Story = {
  args: {},
  render: (args) => (
    <div
      style={{
        padding: "16px",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        minWidth: "300px",
      }}
    >
      <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>Display Settings</h3>
      <ThemeToggle {...args} />
    </div>
  ),
};

/**
 * Multiple toggle options for demonstration.
 */
export const MultipleOptions: Story = {
  args: {},
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <ThemeToggle label="Dark mode" />
      <div style={{ opacity: 0.5, pointerEvents: "none" }}>
        <ThemeToggle label="High contrast (disabled)" />
      </div>
    </div>
  ),
};
