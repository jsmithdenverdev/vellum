import AppLayout from "@cloudscape-design/components/app-layout";

import type { ReactNode } from "react";

export interface SplitViewLayoutProps {
  /** Content for the left navigation panel */
  navigation: ReactNode;
  /** Main content area */
  content: ReactNode;
  /** Content for the right tools panel */
  tools?: ReactNode;
  /** Whether the navigation panel is open */
  navigationOpen: boolean;
  /** Whether the tools panel is open */
  toolsOpen: boolean;
  /** Callback when navigation panel open state changes */
  onNavigationChange: (open: boolean) => void;
  /** Callback when tools panel open state changes */
  onToolsChange: (open: boolean) => void;
  /** Width of the navigation panel in pixels */
  navigationWidth?: number;
  /** Width of the tools panel in pixels */
  toolsWidth?: number;
  /** Optional header content (e.g., breadcrumbs) */
  headerContent?: ReactNode;
}

/**
 * SplitViewLayout Template
 *
 * A layout template that wraps Cloudscape's AppLayout component,
 * providing a consistent split-view interface with navigation,
 * content, and tools panels.
 *
 * Following atomic design principles, this template handles only
 * layout composition without business logic.
 */
export function SplitViewLayout({
  navigation,
  content,
  tools,
  navigationOpen,
  toolsOpen,
  onNavigationChange,
  onToolsChange,
  navigationWidth = 400,
  toolsWidth = 350,
  headerContent,
}: SplitViewLayoutProps) {
  return (
    <AppLayout
      navigation={navigation}
      navigationOpen={navigationOpen}
      onNavigationChange={({ detail }) => onNavigationChange(detail.open)}
      navigationWidth={navigationWidth}
      tools={tools}
      toolsOpen={toolsOpen}
      onToolsChange={({ detail }) => onToolsChange(detail.open)}
      toolsWidth={toolsWidth}
      content={content}
      breadcrumbs={headerContent}
    />
  );
}
