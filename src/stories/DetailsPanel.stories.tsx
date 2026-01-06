/**
 * DetailsPanel Stories
 *
 * Demonstrates the DetailsPanel organism component that displays
 * detailed information about a selected CloudFormation resource.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";
import { DetailsPanel } from "@/components/organisms/DetailsPanel";

import type { CfnNodeData } from "@/types/graph";

// Sample node data for different resource types
const lambdaNodeData: CfnNodeData = {
  logicalId: "ProcessOrderFunction",
  resourceType: "AWS::Lambda::Function",
  properties: {
    FunctionName: "process-order",
    Runtime: "nodejs18.x",
    Handler: "index.handler",
    MemorySize: 256,
    Timeout: 30,
  },
};

const s3NodeData: CfnNodeData = {
  logicalId: "DataBucket",
  resourceType: "AWS::S3::Bucket",
  properties: {
    BucketName: "my-data-bucket",
    VersioningConfiguration: {
      Status: "Enabled",
    },
    PublicAccessBlockConfiguration: {
      BlockPublicAcls: true,
      BlockPublicPolicy: true,
    },
  },
};

const dynamoDbNodeData: CfnNodeData = {
  logicalId: "OrdersTable",
  resourceType: "AWS::DynamoDB::Table",
  properties: {
    TableName: "orders",
    BillingMode: "PAY_PER_REQUEST",
    AttributeDefinitions: [
      { AttributeName: "orderId", AttributeType: "S" },
      { AttributeName: "timestamp", AttributeType: "N" },
    ],
    KeySchema: [
      { AttributeName: "orderId", KeyType: "HASH" },
      { AttributeName: "timestamp", KeyType: "RANGE" },
    ],
  },
};

const ec2NodeData: CfnNodeData = {
  logicalId: "WebServer",
  resourceType: "AWS::EC2::Instance",
  properties: {
    InstanceType: "t3.micro",
    ImageId: "ami-12345678",
    SecurityGroupIds: ["sg-12345678"],
  },
};

const iamRoleNodeData: CfnNodeData = {
  logicalId: "LambdaExecutionRole",
  resourceType: "AWS::IAM::Role",
  properties: {
    RoleName: "lambda-execution-role",
    AssumeRolePolicyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { Service: "lambda.amazonaws.com" },
          Action: "sts:AssumeRole",
        },
      ],
    },
  },
};

const apiGatewayNodeData: CfnNodeData = {
  logicalId: "OrdersAPI",
  resourceType: "AWS::ApiGateway::RestApi",
  properties: {
    Name: "orders-api",
    Description: "REST API for order management",
    EndpointConfiguration: {
      Types: ["REGIONAL"],
    },
  },
};

const unknownNodeData: CfnNodeData = {
  logicalId: "CustomResource",
  resourceType: "AWS::Custom::MyResource",
  properties: {
    CustomProperty: "value",
  },
};

const longIdNodeData: CfnNodeData = {
  logicalId: "VeryLongResourceLogicalIdThatExceedsNormalBoundaries",
  resourceType: "AWS::Lambda::Function",
  properties: {
    FunctionName: "long-name-function",
  },
};

const meta = {
  title: "Organisms/DetailsPanel",
  component: DetailsPanel,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    nodeData: {
      control: "object",
      description: "The selected node data to display (null for no selection)",
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "350px", minHeight: "400px", border: "1px solid #e0e0e0" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DetailsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * No selection - displays placeholder message prompting user to select a resource.
 */
export const NoSelection: Story = {
  args: {
    nodeData: null,
  },
};

/**
 * Lambda function selected - shows details for a serverless function resource.
 */
export const LambdaFunction: Story = {
  args: {
    nodeData: lambdaNodeData,
  },
};

/**
 * S3 bucket selected - shows details for an object storage resource.
 */
export const S3Bucket: Story = {
  args: {
    nodeData: s3NodeData,
  },
};

/**
 * DynamoDB table selected - shows details for a NoSQL database resource.
 */
export const DynamoDBTable: Story = {
  args: {
    nodeData: dynamoDbNodeData,
  },
};

/**
 * EC2 instance selected - shows details for a virtual server resource.
 */
export const EC2Instance: Story = {
  args: {
    nodeData: ec2NodeData,
  },
};

/**
 * IAM role selected - shows details for an access management resource.
 */
export const IAMRole: Story = {
  args: {
    nodeData: iamRoleNodeData,
  },
};

/**
 * API Gateway selected - shows details for a REST API resource.
 */
export const APIGateway: Story = {
  args: {
    nodeData: apiGatewayNodeData,
  },
};

/**
 * Unknown resource type - shows fallback icon for unrecognized resource types.
 */
export const UnknownResourceType: Story = {
  args: {
    nodeData: unknownNodeData,
  },
};

/**
 * Long logical ID - demonstrates how long names are displayed.
 */
export const LongLogicalId: Story = {
  args: {
    nodeData: longIdNodeData,
  },
};

/**
 * Multiple panels comparison - shows different resource types side by side.
 */
export const MultipleResourceTypes: Story = {
  args: {
    nodeData: lambdaNodeData,
  },
  decorators: [() => <div />], // Override default decorator
  render: () => (
    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
      <div style={{ width: "350px", border: "1px solid #e0e0e0" }}>
        <DetailsPanel nodeData={lambdaNodeData} />
      </div>
      <div style={{ width: "350px", border: "1px solid #e0e0e0" }}>
        <DetailsPanel nodeData={s3NodeData} />
      </div>
      <div style={{ width: "350px", border: "1px solid #e0e0e0" }}>
        <DetailsPanel nodeData={dynamoDbNodeData} />
      </div>
    </div>
  ),
};

/**
 * Selection flow - demonstrates the transition from no selection to selected.
 */
export const SelectionFlow: Story = {
  args: {
    nodeData: null,
  },
  decorators: [() => <div />], // Override default decorator
  render: () => (
    <div style={{ display: "flex", gap: "24px" }}>
      <div>
        <p style={{ marginBottom: "8px", fontWeight: "bold", fontSize: "12px" }}>
          Before Selection:
        </p>
        <div style={{ width: "350px", border: "1px solid #e0e0e0" }}>
          <DetailsPanel nodeData={null} />
        </div>
      </div>
      <div>
        <p style={{ marginBottom: "8px", fontWeight: "bold", fontSize: "12px" }}>
          After Double-Click:
        </p>
        <div style={{ width: "350px", border: "1px solid #e0e0e0" }}>
          <DetailsPanel nodeData={lambdaNodeData} />
        </div>
      </div>
    </div>
  ),
};
