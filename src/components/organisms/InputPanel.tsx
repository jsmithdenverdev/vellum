import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import CodeEditor from "@cloudscape-design/components/code-editor";

import type { CodeEditorProps } from "@cloudscape-design/components/code-editor";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";

import ace from "ace-builds";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-dawn";
import "ace-builds/src-noconflict/theme-tomorrow_night";

export interface InputPanelProps {
  value: string;
  onChange: (value: string) => void;
  onVisualize: () => void;
  error?: string;
  isLoading?: boolean;
  isDarkMode?: boolean;
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
  isDarkMode = false,
}: InputPanelProps) {
  const editorTheme = isDarkMode ? "tomorrow_night" : "dawn";

  const handlePreferencesChange: CodeEditorProps["onPreferencesChange"] = () => {
    // Preferences are managed externally based on system theme
  };

  return (
    <Box padding="m">
      <SpaceBetween direction="vertical" size="l">
        <Header
          variant="h2"
          description="Paste your CloudFormation JSON or YAML template below"
        >
          Template Input
        </Header>

        <div style={{ height: "calc(100vh - 280px)", minHeight: "400px" }}>
          <CodeEditor
            ace={ace}
            language="json"
            value={value}
            onDelayedChange={({ detail }) => onChange(detail.value)}
            onPreferencesChange={handlePreferencesChange}
            preferences={{ theme: editorTheme, wrapLines: true }}
            loading={isLoading}
            i18nStrings={i18nStrings}
            editorContentHeight={500}
            themes={{
              light: ["dawn"],
              dark: ["tomorrow_night"],
            }}
          />
        </div>

        {error && (
          <Alert type="error" header="Template Error">
            {error}
          </Alert>
        )}

        <Box textAlign="right">
          <Button
            variant="primary"
            onClick={onVisualize}
            loading={isLoading}
            disabled={!value.trim()}
          >
            Visualize
          </Button>
        </Box>
      </SpaceBetween>
    </Box>
  );
}
