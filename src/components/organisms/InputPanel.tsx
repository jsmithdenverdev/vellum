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
};

const editorContainerStyles: React.CSSProperties = {
  flex: 1,
  minHeight: 0,
  overflow: "hidden",
};

const footerStyles: React.CSSProperties = {
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

  const handlePreferencesChange: CodeEditorProps["onPreferencesChange"] = () => {
    // Preferences are managed externally based on system theme
  };

  return (
    <div style={containerStyles}>
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
          preferences={{ theme: editorTheme, wrapLines: true }}
          loading={isLoading}
          i18nStrings={i18nStrings}
          editorContentHeight={800}
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
