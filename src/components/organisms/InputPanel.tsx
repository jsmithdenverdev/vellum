import Alert from '@cloudscape-design/components/alert'
import Box from '@cloudscape-design/components/box'
import Button from '@cloudscape-design/components/button'
import Container from '@cloudscape-design/components/container'
import Header from '@cloudscape-design/components/header'
import SpaceBetween from '@cloudscape-design/components/space-between'
import Textarea from '@cloudscape-design/components/textarea'

export interface InputPanelProps {
  value: string
  onChange: (value: string) => void
  onVisualize: () => void
  error?: string
  isLoading?: boolean
}

export function InputPanel({
  value,
  onChange,
  onVisualize,
  error,
  isLoading = false,
}: InputPanelProps) {
  return (
    <Container
      header={
        <Header variant="h2" description="Paste your CloudFormation JSON or YAML template below">
          Template Input
        </Header>
      }
    >
      <SpaceBetween direction="vertical" size="l">
        <Textarea
          value={value}
          onChange={({ detail }) => onChange(detail.value)}
          placeholder={`{
  "AWSTemplateFormatVersion": "2010-09-09",
  "Resources": {
    ...
  }
}`}
          rows={20}
          ariaLabel="CloudFormation template input"
        />

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
    </Container>
  )
}
