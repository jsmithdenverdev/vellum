/**
 * InputPanel Stories
 *
 * Demonstrates the InputPanel organism component that provides
 * a code editor for CloudFormation template input.
 */

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { InputPanel } from "@/components/organisms/InputPanel";

// Sample CloudFormation template
const sampleTemplate = `{
  "AWSTemplateFormatVersion": "2010-09-09",
  "Description": "Sample CloudFormation template",
  "Resources": {
    "MyLambdaFunction": {
      "Type": "AWS::Lambda::Function",
      "Properties": {
        "FunctionName": "my-function",
        "Runtime": "nodejs18.x",
        "Handler": "index.handler",
        "Role": { "Fn::GetAtt": ["LambdaExecutionRole", "Arn"] }
      }
    },
    "LambdaExecutionRole": {
      "Type": "AWS::IAM::Role",
      "Properties": {
        "RoleName": "lambda-execution-role",
        "AssumeRolePolicyDocument": {
          "Version": "2012-10-17",
          "Statement": [{
            "Effect": "Allow",
            "Principal": { "Service": "lambda.amazonaws.com" },
            "Action": "sts:AssumeRole"
          }]
        }
      }
    },
    "DataBucket": {
      "Type": "AWS::S3::Bucket",
      "Properties": {
        "BucketName": "my-data-bucket"
      }
    }
  }
}`;

// Invalid template for error demonstration
const invalidTemplate = `{
  "Resources": {
    invalid json here
  }
}`;

const meta = {
  title: "Organisms/InputPanel",
  component: InputPanel,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: "text",
      description: "Editor content (CloudFormation template)",
    },
    error: {
      control: "text",
      description: "Error message to display",
    },
    isLoading: {
      control: "boolean",
      description: "Loading state for the editor and button",
    },
  },
  args: {
    onChange: fn(),
    onVisualize: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ height: "100vh", width: "400px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InputPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Empty editor - initial state with no template.
 * Shows the placeholder text and disabled visualize button.
 */
export const EmptyEditor: Story = {
  args: {
    value: "",
    isLoading: false,
  },
};

/**
 * With template - editor populated with a valid CloudFormation template.
 * The visualize button is enabled.
 */
export const WithTemplate: Story = {
  args: {
    value: sampleTemplate,
    isLoading: false,
  },
};

/**
 * With error - displays an error alert below the editor.
 * Useful for showing parse or validation errors.
 */
export const WithError: Story = {
  args: {
    value: invalidTemplate,
    error: "Invalid JSON: Unexpected token at line 3, column 5",
    isLoading: false,
  },
};

/**
 * Loading state - shows loading indicator on editor and button.
 */
export const LoadingState: Story = {
  args: {
    value: sampleTemplate,
    isLoading: true,
  },
};

/**
 * Interactive example - demonstrates the full interaction flow.
 */
export const Interactive: Story = {
  args: {
    value: "",
    isLoading: false,
  },
  render: function InteractiveInputPanel() {
    const [value, setValue] = useState("");
    const [error, setError] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState(false);

    const handleVisualize = () => {
      setIsLoading(true);
      setError(undefined);

      // Simulate async validation
      setTimeout(() => {
        try {
          JSON.parse(value);
          setIsLoading(false);
          console.log("Template validated successfully");
        } catch {
          setError("Invalid JSON: Please check your template syntax");
          setIsLoading(false);
        }
      }, 1000);
    };

    return (
      <InputPanel
        value={value}
        onChange={setValue}
        onVisualize={handleVisualize}
        error={error}
        isLoading={isLoading}
      />
    );
  },
};

/**
 * Large template - demonstrates the editor with a larger CloudFormation template.
 */
export const LargeTemplate: Story = {
  args: {
    value: `{
  "AWSTemplateFormatVersion": "2010-09-09",
  "Description": "Large CloudFormation template with many resources",
  "Parameters": {
    "Environment": {
      "Type": "String",
      "Default": "development",
      "AllowedValues": ["development", "staging", "production"]
    }
  },
  "Resources": {
    "VPC": {
      "Type": "AWS::EC2::VPC",
      "Properties": {
        "CidrBlock": "10.0.0.0/16",
        "EnableDnsHostnames": true
      }
    },
    "PublicSubnet": {
      "Type": "AWS::EC2::Subnet",
      "Properties": {
        "VpcId": { "Ref": "VPC" },
        "CidrBlock": "10.0.1.0/24"
      }
    },
    "PrivateSubnet": {
      "Type": "AWS::EC2::Subnet",
      "Properties": {
        "VpcId": { "Ref": "VPC" },
        "CidrBlock": "10.0.2.0/24"
      }
    },
    "InternetGateway": {
      "Type": "AWS::EC2::InternetGateway"
    },
    "ApiGateway": {
      "Type": "AWS::ApiGateway::RestApi",
      "Properties": {
        "Name": "my-api"
      }
    },
    "LambdaFunction": {
      "Type": "AWS::Lambda::Function",
      "Properties": {
        "FunctionName": "api-handler",
        "Runtime": "nodejs18.x",
        "Handler": "index.handler"
      }
    },
    "DynamoDBTable": {
      "Type": "AWS::DynamoDB::Table",
      "Properties": {
        "TableName": "my-table",
        "AttributeDefinitions": [
          { "AttributeName": "id", "AttributeType": "S" }
        ],
        "KeySchema": [
          { "AttributeName": "id", "KeyType": "HASH" }
        ],
        "BillingMode": "PAY_PER_REQUEST"
      }
    }
  }
}`,
    isLoading: false,
  },
};
