/**
 * Storybook Preview Configuration
 *
 * Sets up global decorators and parameters for all stories.
 */

import type { Preview, Decorator } from "@storybook/react-vite";
import { Mode, applyMode } from "@cloudscape-design/global-styles";
import "@cloudscape-design/global-styles/index.css";
import { ThemeProvider } from "../src/contexts/ThemeContext";
import { CloudscapeModeWrapper } from "./decorators/CloudscapeModeWrapper";

// Apply Cloudscape light mode by default for Storybook
applyMode(Mode.Light);

/**
 * Decorator that wraps stories in the ThemeProvider context.
 * This is required for components that use the useTheme hook.
 */
const withThemeProvider: Decorator = (Story, context) => {
  // Apply Cloudscape mode based on Storybook background
  const isDarkBackground =
    context.globals?.backgrounds?.value === "#333" ||
    context.globals?.backgrounds?.value === "#1a1a1a";

  return (
    <ThemeProvider>
      <CloudscapeModeWrapper isDarkBackground={isDarkBackground}>
        <Story />
      </CloudscapeModeWrapper>
    </ThemeProvider>
  );
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#f8f8f8" },
        { name: "dark", value: "#1a1a1a" },
      ],
    },
  },
  decorators: [withThemeProvider],
};

export default preview;
