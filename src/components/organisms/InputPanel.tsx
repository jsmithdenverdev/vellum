import { useState, useRef, useEffect } from "react";
import Alert from "@cloudscape-design/components/alert";
import Button from "@cloudscape-design/components/button";
import CodeEditor from "@cloudscape-design/components/code-editor";

import type { CodeEditorProps } from "@cloudscape-design/components/code-editor";
import Header from "@cloudscape-design/components/header";

import ace from "ace-builds";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-dawn";
import "ace-builds/src-noconflict/theme-tomorrow_night";

import { useTheme } from "@/hooks";

export interface InputPanelProps {
  value: string;
  onChange: (value: string) => void;
  onVisualize: () => void;
  error?: string;
  isLoading?: boolean;
}

const i18nStrings: CodeEditorProps.I18nStrings = {
  loadingState: "Loading code editor",
  errorState: "There was an error loading the code editor.",
  errorStateRecovery: "Retry",
  editorGroupAriaLabel: "Code editor",
  statusBarGroupAriaLabel: "Status bar",
  cursorPosition: (row, column) => `Ln ${row}, Col ${column}`,
  errorsTab: "Errors",
  warningsTab: "Warnings",
  preferencesButtonAriaLabel: "Preferences",
  paneCloseButtonAriaLabel: "Close",
  preferencesModalHeader: "Preferences",
  preferencesModalCancel: "Cancel",
  preferencesModalConfirm: "Confirm",
  preferencesModalWrapLines: "Wrap lines",
  preferencesModalTheme: "Theme",
  preferencesModalLightThemes: "Light themes",
  preferencesModalDarkThemes: "Dark themes",
};

// Styles
const containerStyles: React.CSSProperties = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  padding: "16px",
  gap: "16px",
  boxSizing: "border-box",
};

const editorContainerStyles: React.CSSProperties = {
  flex: 1,
  minHeight: 0,
};

const footerStyles: React.CSSProperties = {
  flexShrink: 0,
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

export function InputPanel({
  value,
  onChange,
  onVisualize,
  error,
  isLoading = false,
}: InputPanelProps) {
  const { isDarkMode } = useTheme();
  const editorTheme = isDarkMode ? "tomorrow_night" : "dawn";
  const containerRef = useRef<HTMLDivElement>(null);
  const [editorHeight, setEditorHeight] = useState(400);

  // Calculate editor height based on container
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        // Subtract header (~80px), footer (~60px), gaps (32px), padding (32px)
        const availableHeight = containerHeight - 180;
        setEditorHeight(Math.max(200, availableHeight));
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const handlePreferencesChange: CodeEditorProps["onPreferencesChange"] = () => {
    // Preferences are managed externally based on system theme
  };

  const handleEditorResize: CodeEditorProps["onEditorContentResize"] = (event) => {
    setEditorHeight(event.detail.height);
  };

  return (
    <div ref={containerRef} style={containerStyles}>
      {/* Header */}
      <Header
        variant="h2"
        description="Paste your CloudFormation JSON or YAML template below"
      >
        Template Input
      </Header>

      {/* Editor - takes remaining space */}
      <div style={editorContainerStyles}>
        <CodeEditor
          ace={ace}
          language="json"
          value={value}
          onDelayedChange={({ detail }) => onChange(detail.value)}
          onPreferencesChange={handlePreferencesChange}
          onEditorContentResize={handleEditorResize}
          preferences={{ theme: editorTheme, wrapLines: true }}
          loading={isLoading}
          i18nStrings={i18nStrings}
          editorContentHeight={editorHeight}
          themes={{
            light: ["dawn"],
            dark: ["tomorrow_night"],
          }}
        />
      </div>

      {/* Footer - error and button */}
      <div style={footerStyles}>
        {error && (
          <Alert type="error" header="Template Error">
            {error}
          </Alert>
        )}

        <div style={{ textAlign: "right" }}>
          <Button
            variant="primary"
            onClick={onVisualize}
            loading={isLoading}
            disabled={!value.trim()}
          >
            Visualize
          </Button>
        </div>
      </div>
    </div>
  );
}
