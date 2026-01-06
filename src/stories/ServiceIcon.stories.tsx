/**
 * ServiceIcon Stories
 *
 * Demonstrates the ServiceIcon atom component that displays AWS service icons
 * based on CloudFormation resource types.
 */

import type { Meta, StoryObj } from "@storybook/react-vite";
import { ServiceIcon } from "@/components/atoms/ServiceIcon";

const meta = {
  title: "Atoms/ServiceIcon",
  component: ServiceIcon,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    serviceType: {
      control: "text",
      description: "CloudFormation resource type (e.g., AWS::Lambda::Function)",
    },
    size: {
      control: { type: "range", min: 16, max: 128, step: 8 },
      description: "Icon size in pixels",
    },
  },
} satisfies Meta<typeof ServiceIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Lambda function icon - commonly used serverless compute service.
 */
export const Lambda: Story = {
  args: {
    serviceType: "AWS::Lambda::Function",
    size: 48,
  },
};

/**
 * S3 bucket icon - object storage service.
 */
export const S3Bucket: Story = {
  args: {
    serviceType: "AWS::S3::Bucket",
    size: 48,
  },
};

/**
 * DynamoDB table icon - NoSQL database service.
 */
export const DynamoDB: Story = {
  args: {
    serviceType: "AWS::DynamoDB::Table",
    size: 48,
  },
};

/**
 * EC2 instance icon - virtual server compute service.
 */
export const EC2Instance: Story = {
  args: {
    serviceType: "AWS::EC2::Instance",
    size: 48,
  },
};

/**
 * IAM Role icon - identity and access management.
 */
export const IAMRole: Story = {
  args: {
    serviceType: "AWS::IAM::Role",
    size: 48,
  },
};

/**
 * SNS Topic icon - notification service.
 */
export const SNSTopic: Story = {
  args: {
    serviceType: "AWS::SNS::Topic",
    size: 48,
  },
};

/**
 * SQS Queue icon - message queuing service.
 */
export const SQSQueue: Story = {
  args: {
    serviceType: "AWS::SQS::Queue",
    size: 48,
  },
};

/**
 * API Gateway icon - REST API service.
 */
export const APIGateway: Story = {
  args: {
    serviceType: "AWS::ApiGateway::RestApi",
    size: 48,
  },
};

/**
 * Unknown service type shows an abbreviation fallback.
 * Demonstrates graceful degradation for unrecognized resource types.
 */
export const UnknownService: Story = {
  args: {
    serviceType: "AWS::Custom::MyResource",
    size: 48,
  },
};

/**
 * Small icon size (24px) - useful for compact UI elements.
 */
export const SmallSize: Story = {
  args: {
    serviceType: "AWS::Lambda::Function",
    size: 24,
  },
};

/**
 * Medium icon size (40px) - default size for node cards.
 */
export const MediumSize: Story = {
  args: {
    serviceType: "AWS::Lambda::Function",
    size: 40,
  },
};

/**
 * Large icon size (64px) - useful for detail panels.
 */
export const LargeSize: Story = {
  args: {
    serviceType: "AWS::Lambda::Function",
    size: 64,
  },
};

/**
 * Extra large icon size (96px) - for featured displays.
 */
export const ExtraLargeSize: Story = {
  args: {
    serviceType: "AWS::Lambda::Function",
    size: 96,
  },
};

/**
 * Grid showing multiple service icons together.
 */
export const IconGrid: Story = {
  args: {
    serviceType: "AWS::Lambda::Function",
    size: 48,
  },
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px",
        padding: "16px",
      }}
    >
      <ServiceIcon serviceType="AWS::Lambda::Function" size={48} />
      <ServiceIcon serviceType="AWS::S3::Bucket" size={48} />
      <ServiceIcon serviceType="AWS::DynamoDB::Table" size={48} />
      <ServiceIcon serviceType="AWS::EC2::Instance" size={48} />
      <ServiceIcon serviceType="AWS::IAM::Role" size={48} />
      <ServiceIcon serviceType="AWS::SNS::Topic" size={48} />
      <ServiceIcon serviceType="AWS::SQS::Queue" size={48} />
      <ServiceIcon serviceType="AWS::ApiGateway::RestApi" size={48} />
    </div>
  ),
};
