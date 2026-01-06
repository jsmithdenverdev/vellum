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

export function InputPanel({
  value,
  onChange,
  onVisualize,
  error,
  isLoading = false,
}: InputPanelProps) {
  const { isDarkMode } = useTheme();
  const editorTheme = isDarkMode ? "tomorrow_night" : "dawn";
  const editorAreaRef = useRef<HTMLDivElement>(null);
  const [editorHeight, setEditorHeight] = useState(400);

  // Calculate editor height based on editor area container
  useEffect(() => {
    const updateHeight = () => {
      if (editorAreaRef.current) {
        // Get the available height in the editor area, minus button row (~50px)
        const availableHeight = editorAreaRef.current.clientHeight - 60;
        setEditorHeight(Math.max(200, availableHeight));
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    // Also observe the container for size changes
    const resizeObserver = new ResizeObserver(updateHeight);
    if (editorAreaRef.current) {
      resizeObserver.observe(editorAreaRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateHeight);
      resizeObserver.disconnect();
    };
  }, []);

  const handlePreferencesChange: CodeEditorProps["onPreferencesChange"] = () => {
    // Preferences are managed externally based on system theme
  };

  const handleEditorResize: CodeEditorProps["onEditorContentResize"] = (event) => {
    setEditorHeight(event.detail.height);
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "16px",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Header - fixed height */}
      <div style={{ flexShrink: 0, marginBottom: "16px" }}>
        <Header
          variant="h2"
          description="Paste your CloudFormation JSON or YAML template below"
        >
          Template Input
        </Header>
      </div>

      {/* Error alert - if present */}
      {error && (
        <div style={{ flexShrink: 0, marginBottom: "16px" }}>
          <Alert type="error" header="Template Error">
            {error}
          </Alert>
        </div>
      )}

      {/* Editor area - flex grows to fill remaining space */}
      <div
        ref={editorAreaRef}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {/* Editor - grows within editor area */}
        <div style={{ flex: 1, minHeight: 0 }}>
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

        {/* Button - fixed at bottom of editor area */}
        <div style={{ flexShrink: 0, textAlign: "right", marginTop: "16px" }}>
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
