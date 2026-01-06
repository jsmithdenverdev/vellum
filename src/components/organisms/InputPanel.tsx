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

  const handlePreferencesChange: CodeEditorProps["onPreferencesChange"] = () => {
    // Preferences are managed externally based on system theme
  };

  return (
    <div style={{ padding: "16px" }}>
      {/* Header */}
      <div style={{ marginBottom: "16px" }}>
        <Header
          variant="h2"
          description="Paste your CloudFormation JSON or YAML template below"
        >
          Template Input
        </Header>
      </div>

      {/* Error alert - if present */}
      {error && (
        <div style={{ marginBottom: "16px" }}>
          <Alert type="error" header="Template Error">
            {error}
          </Alert>
        </div>
      )}

      {/* Editor */}
      <CodeEditor
        ace={ace}
        language="json"
        value={value}
        onDelayedChange={({ detail }) => onChange(detail.value)}
        onPreferencesChange={handlePreferencesChange}
        preferences={{ theme: editorTheme, wrapLines: true }}
        loading={isLoading}
        i18nStrings={i18nStrings}
        themes={{
          light: ["dawn"],
          dark: ["tomorrow_night"],
        }}
      />

      {/* Button */}
      <div style={{ textAlign: "right", marginTop: "16px" }}>
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
  );
}
