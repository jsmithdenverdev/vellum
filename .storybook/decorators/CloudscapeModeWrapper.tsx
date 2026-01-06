/**
 * CloudscapeModeWrapper
 *
 * Wrapper component that applies Cloudscape mode based on background theme.
 * Extracted to its own file to satisfy react-refresh linting rules.
 */

import { useEffect, type ReactNode } from "react";
import { Mode, applyMode } from "@cloudscape-design/global-styles";

interface CloudscapeModeWrapperProps {
  children: ReactNode;
  isDarkBackground: boolean;
}

/**
 * Applies Cloudscape mode (light/dark) based on the isDarkBackground prop.
 * Uses useEffect to sync with the Storybook background selection.
 */
export function CloudscapeModeWrapper({
  children,
  isDarkBackground,
}: CloudscapeModeWrapperProps) {
  useEffect(() => {
    applyMode(isDarkBackground ? Mode.Dark : Mode.Light);
  }, [isDarkBackground]);

  return <>{children}</>;
}
