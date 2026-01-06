/**
 * ResourceNode Stories
 *
 * Demonstrates the ResourceNode molecule component used as custom React Flow nodes
 * for displaying CloudFormation resources. Styled to match AWS Infrastructure Composer.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";
import { ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ResourceNode } from "@/components/molecules/ResourceNode";

import type { CfnNodeData } from "@/types/graph";

/**
 * Wrapper component that provides ReactFlowProvider context
 * required for ResourceNode to render properly with handles.
 */
function ReactFlowWrapper({
  data,
  selected = false,
}: {
  data: CfnNodeData;
  selected?: boolean;
}) {
  return (
    <ReactFlowProvider>
      <div style={{ padding: "20px" }}>
        <ResourceNode
          id="demo-node"
          type="cfnResource"
          data={data}
          selected={selected}
          dragging={false}
          zIndex={1}
          isConnectable={true}
          positionAbsoluteX={0}
          positionAbsoluteY={0}
          deletable={false}
          selectable={true}
          parentId={undefined}
          draggable={true}
        />
      </div>
    </ReactFlowProvider>
  );
}

const meta = {
  title: "Molecules/ResourceNode",
  component: ReactFlowWrapper,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    data: {
      control: "object",
      description: "Node data containing logicalId, resourceType, and properties",
    },
    selected: {
      control: "boolean",
      description: "Whether the node is currently selected",
    },
  },
} satisfies Meta<typeof ReactFlowWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample node data for different resource types
const lambdaNodeData: CfnNodeData = {
  logicalId: "ProcessOrderFunction",
  resourceType: "AWS::Lambda::Function",
  properties: {
    FunctionName: "process-order",
    Runtime: "nodejs18.x",
    Handler: "index.handler",
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
  },
};

const dynamoDbNodeData: CfnNodeData = {
  logicalId: "OrdersTable",
  resourceType: "AWS::DynamoDB::Table",
  properties: {
    TableName: "orders",
    AttributeDefinitions: [],
    KeySchema: [],
  },
};

const ec2NodeData: CfnNodeData = {
  logicalId: "WebServer",
  resourceType: "AWS::EC2::Instance",
  properties: {
    InstanceType: "t3.micro",
    ImageId: "ami-12345678",
  },
};

const iamRoleNodeData: CfnNodeData = {
  logicalId: "LambdaExecutionRole",
  resourceType: "AWS::IAM::Role",
  properties: {
    RoleName: "lambda-execution-role",
    AssumeRolePolicyDocument: {},
  },
};

const sqsNodeData: CfnNodeData = {
  logicalId: "OrderQueue",
  resourceType: "AWS::SQS::Queue",
  properties: {
    QueueName: "order-queue",
    VisibilityTimeout: 30,
  },
};

const snsNodeData: CfnNodeData = {
  logicalId: "NotificationTopic",
  resourceType: "AWS::SNS::Topic",
  properties: {
    TopicName: "notifications",
  },
};

const apiGatewayNodeData: CfnNodeData = {
  logicalId: "OrdersAPI",
  resourceType: "AWS::ApiGateway::RestApi",
  properties: {
    Name: "orders-api",
  },
};

/**
 * Lambda function node - serverless compute resource.
 */
export const LambdaFunction: Story = {
  args: {
    data: lambdaNodeData,
    selected: false,
  },
};

/**
 * S3 bucket node - object storage resource.
 */
export const S3Bucket: Story = {
  args: {
    data: s3NodeData,
    selected: false,
  },
};

/**
 * DynamoDB table node - NoSQL database resource.
 */
export const DynamoDBTable: Story = {
  args: {
    data: dynamoDbNodeData,
    selected: false,
  },
};

/**
 * EC2 instance node - virtual server resource.
 */
export const EC2Instance: Story = {
  args: {
    data: ec2NodeData,
    selected: false,
  },
};

/**
 * IAM role node - access management resource.
 */
export const IAMRole: Story = {
  args: {
    data: iamRoleNodeData,
    selected: false,
  },
};

/**
 * SQS queue node - message queue resource.
 */
export const SQSQueue: Story = {
  args: {
    data: sqsNodeData,
    selected: false,
  },
};

/**
 * SNS topic node - notification resource.
 */
export const SNSTopic: Story = {
  args: {
    data: snsNodeData,
    selected: false,
  },
};

/**
 * API Gateway node - REST API resource.
 */
export const APIGateway: Story = {
  args: {
    data: apiGatewayNodeData,
    selected: false,
  },
};

/**
 * Selected state - shows the visual highlight when a node is selected.
 * Blue border and enhanced shadow indicate selection.
 */
export const SelectedState: Story = {
  args: {
    data: lambdaNodeData,
    selected: true,
  },
};

/**
 * Highlighted state - shows visual highlight for search matches.
 */
export const HighlightedState: Story = {
  args: {
    data: {
      ...lambdaNodeData,
      isHighlighted: true,
    },
    selected: false,
  },
};

/**
 * Dimmed state - shows reduced opacity for non-matching nodes during search.
 */
export const DimmedState: Story = {
  args: {
    data: {
      ...lambdaNodeData,
      isDimmed: true,
    },
    selected: false,
  },
};

/**
 * Long logical ID - demonstrates text truncation with ellipsis.
 */
export const LongLogicalId: Story = {
  args: {
    data: {
      logicalId: "VeryLongResourceLogicalIdThatShouldBeTruncated",
      resourceType: "AWS::Lambda::Function",
      properties: {},
    },
    selected: false,
  },
};

/**
 * Unknown resource type - shows fallback icon abbreviation.
 */
export const UnknownResourceType: Story = {
  args: {
    data: {
      logicalId: "CustomResource",
      resourceType: "AWS::Custom::MyResource",
      properties: {},
    },
    selected: false,
  },
};

/**
 * Multiple nodes comparison - shows various node types side by side.
 */
export const NodeComparison: Story = {
  args: {
    data: lambdaNodeData,
    selected: false,
  },
  render: () => (
    <ReactFlowProvider>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "20px" }}>
        <ResourceNode
          id="lambda"
          type="cfnResource"
          data={lambdaNodeData}
          selected={false}
          dragging={false}
          zIndex={1}
          isConnectable={true}
          positionAbsoluteX={0}
          positionAbsoluteY={0}
          deletable={false}
          selectable={true}
          parentId={undefined}
          draggable={true}
        />
        <ResourceNode
          id="s3"
          type="cfnResource"
          data={s3NodeData}
          selected={false}
          dragging={false}
          zIndex={1}
          isConnectable={true}
          positionAbsoluteX={0}
          positionAbsoluteY={100}
          deletable={false}
          selectable={true}
          parentId={undefined}
          draggable={true}
        />
        <ResourceNode
          id="dynamo"
          type="cfnResource"
          data={dynamoDbNodeData}
          selected={true}
          dragging={false}
          zIndex={1}
          isConnectable={true}
          positionAbsoluteX={0}
          positionAbsoluteY={200}
          deletable={false}
          selectable={true}
          parentId={undefined}
          draggable={true}
        />
      </div>
    </ReactFlowProvider>
  ),
};
