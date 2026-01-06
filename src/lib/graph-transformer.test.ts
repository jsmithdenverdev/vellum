/**
 * Graph Transformer Tests
 */

import { describe, it, expect } from "vitest";
import { transformToGraph } from "@/lib/graph-transformer";
import type { CloudFormationTemplate } from "@/types/cloudformation";

// =============================================================================
// Test Fixtures
// =============================================================================

/**
 * Creates a minimal template with the given resources
 */
function createTemplate(
  resources: CloudFormationTemplate["Resources"],
  parameters?: CloudFormationTemplate["Parameters"]
): CloudFormationTemplate {
  return {
    Resources: resources,
    Parameters: parameters,
  };
}

// =============================================================================
// Node Generation Tests
// =============================================================================

describe("transformToGraph - Node Generation", () => {
  it("should create a node for each resource", () => {
    const template = createTemplate({
      MyBucket: {
        Type: "AWS::S3::Bucket",
      },
      MyQueue: {
        Type: "AWS::SQS::Queue",
      },
    });

    const graph = transformToGraph(template);

    expect(graph.nodes).toHaveLength(2);
    expect(graph.nodes.map((n) => n.id)).toEqual(
      expect.arrayContaining(["MyBucket", "MyQueue"])
    );
  });

  it("should set node id to the logical ID", () => {
    const template = createTemplate({
      MyLambdaFunction: {
        Type: "AWS::Lambda::Function",
      },
    });

    const graph = transformToGraph(template);

    expect(graph.nodes[0].id).toBe("MyLambdaFunction");
  });

  it("should include logicalId in node data", () => {
    const template = createTemplate({
      MyBucket: {
        Type: "AWS::S3::Bucket",
      },
    });

    const graph = transformToGraph(template);

    expect(graph.nodes[0].data.logicalId).toBe("MyBucket");
  });

  it("should include resourceType in node data", () => {
    const template = createTemplate({
      MyBucket: {
        Type: "AWS::S3::Bucket",
      },
    });

    const graph = transformToGraph(template);

    expect(graph.nodes[0].data.resourceType).toBe("AWS::S3::Bucket");
  });

  it("should include properties in node data", () => {
    const template = createTemplate({
      MyBucket: {
        Type: "AWS::S3::Bucket",
        Properties: {
          BucketName: "my-bucket",
          VersioningConfiguration: {
            Status: "Enabled",
          },
        },
      },
    });

    const graph = transformToGraph(template);

    expect(graph.nodes[0].data.properties).toEqual({
      BucketName: "my-bucket",
      VersioningConfiguration: {
        Status: "Enabled",
      },
    });
  });

  it("should set empty properties object when resource has no properties", () => {
    const template = createTemplate({
      MyBucket: {
        Type: "AWS::S3::Bucket",
      },
    });

    const graph = transformToGraph(template);

    expect(graph.nodes[0].data.properties).toEqual({});
  });

  it("should set initial position to (0, 0)", () => {
    const template = createTemplate({
      MyBucket: {
        Type: "AWS::S3::Bucket",
      },
    });

    const graph = transformToGraph(template);

    expect(graph.nodes[0].position).toEqual({ x: 0, y: 0 });
  });

  it("should set node type to cfnResource", () => {
    const template = createTemplate({
      MyBucket: {
        Type: "AWS::S3::Bucket",
      },
    });

    const graph = transformToGraph(template);

    expect(graph.nodes[0].type).toBe("cfnResource");
  });
});

// =============================================================================
// Ref Edge Detection Tests
// =============================================================================

describe("transformToGraph - Ref Edge Detection", () => {
  it("should create edge for Ref to another resource", () => {
    const template = createTemplate({
      MyRole: {
        Type: "AWS::IAM::Role",
        Properties: {
          AssumeRolePolicyDocument: {},
        },
      },
      MyFunction: {
        Type: "AWS::Lambda::Function",
        Properties: {
          Role: { Ref: "MyRole" },
        },
      },
    });

    const graph = transformToGraph(template);

    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0]).toMatchObject({
      source: "MyRole",
      target: "MyFunction",
      data: {
        refType: "Ref",
      },
    });
  });

  it("should create multiple edges for multiple Refs", () => {
    const template = createTemplate({
      ResourceA: {
        Type: "AWS::S3::Bucket",
      },
      ResourceB: {
        Type: "AWS::SQS::Queue",
      },
      ResourceC: {
        Type: "AWS::Lambda::Function",
        Properties: {
          BucketRef: { Ref: "ResourceA" },
          QueueRef: { Ref: "ResourceB" },
        },
      },
    });

    const graph = transformToGraph(template);

    const edges = graph.edges.filter((e) => e.target === "ResourceC");
    expect(edges).toHaveLength(2);
    expect(edges.map((e) => e.source)).toEqual(
      expect.arrayContaining(["ResourceA", "ResourceB"])
    );
  });
});

// =============================================================================
// GetAtt Edge Detection Tests
// =============================================================================

describe("transformToGraph - Fn::GetAtt Edge Detection", () => {
  it("should create edge for Fn::GetAtt array syntax", () => {
    const template = createTemplate({
      MyRole: {
        Type: "AWS::IAM::Role",
        Properties: {
          AssumeRolePolicyDocument: {},
        },
      },
      MyFunction: {
        Type: "AWS::Lambda::Function",
        Properties: {
          Role: { "Fn::GetAtt": ["MyRole", "Arn"] },
        },
      },
    });

    const graph = transformToGraph(template);

    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0]).toMatchObject({
      source: "MyRole",
      target: "MyFunction",
      data: {
        refType: "GetAtt",
        attribute: "Arn",
      },
    });
  });

  it("should create edge for Fn::GetAtt string syntax", () => {
    const template = createTemplate({
      MyRole: {
        Type: "AWS::IAM::Role",
        Properties: {
          AssumeRolePolicyDocument: {},
        },
      },
      MyFunction: {
        Type: "AWS::Lambda::Function",
        Properties: {
          Role: { "Fn::GetAtt": "MyRole.Arn" },
        },
      },
    });

    const graph = transformToGraph(template);

    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0]).toMatchObject({
      source: "MyRole",
      target: "MyFunction",
      data: {
        refType: "GetAtt",
        attribute: "Arn",
      },
    });
  });

  it("should include attribute in edge data", () => {
    const template = createTemplate({
      MyQueue: {
        Type: "AWS::SQS::Queue",
      },
      MyFunction: {
        Type: "AWS::Lambda::Function",
        Properties: {
          Environment: {
            Variables: {
              QUEUE_URL: { "Fn::GetAtt": ["MyQueue", "QueueUrl"] },
            },
          },
        },
      },
    });

    const graph = transformToGraph(template);

    expect(graph.edges[0].data?.attribute).toBe("QueueUrl");
  });
});

// =============================================================================
// DependsOn Edge Detection Tests
// =============================================================================

describe("transformToGraph - DependsOn Edge Detection", () => {
  it("should create edge for DependsOn string", () => {
    const template = createTemplate({
      MyBucket: {
        Type: "AWS::S3::Bucket",
      },
      MyQueue: {
        Type: "AWS::SQS::Queue",
        DependsOn: "MyBucket",
      },
    });

    const graph = transformToGraph(template);

    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0]).toMatchObject({
      source: "MyBucket",
      target: "MyQueue",
      data: {
        refType: "DependsOn",
      },
    });
  });

  it("should create edges for DependsOn array", () => {
    const template = createTemplate({
      MyBucket: {
        Type: "AWS::S3::Bucket",
      },
      MyQueue: {
        Type: "AWS::SQS::Queue",
      },
      MyFunction: {
        Type: "AWS::Lambda::Function",
        DependsOn: ["MyBucket", "MyQueue"],
      },
    });

    const graph = transformToGraph(template);

    const edges = graph.edges.filter((e) => e.target === "MyFunction");
    expect(edges).toHaveLength(2);
    expect(edges.map((e) => e.source)).toEqual(
      expect.arrayContaining(["MyBucket", "MyQueue"])
    );
    expect(edges.every((e) => e.data?.refType === "DependsOn")).toBe(true);
  });
});

// =============================================================================
// Nested Intrinsic Function Tests
// =============================================================================

describe("transformToGraph - Nested Intrinsic Functions", () => {
  it("should detect Ref inside Fn::Join", () => {
    const template = createTemplate({
      MyBucket: {
        Type: "AWS::S3::Bucket",
      },
      MyFunction: {
        Type: "AWS::Lambda::Function",
        Properties: {
          FunctionName: {
            "Fn::Join": ["-", ["prefix", { Ref: "MyBucket" }]],
          },
        },
      },
    });

    const graph = transformToGraph(template);

    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0]).toMatchObject({
      source: "MyBucket",
      target: "MyFunction",
      data: { refType: "Ref" },
    });
  });

  it("should detect GetAtt inside Fn::If", () => {
    const template = createTemplate({
      MyBucket: {
        Type: "AWS::S3::Bucket",
      },
      MyFunction: {
        Type: "AWS::Lambda::Function",
        Properties: {
          Environment: {
            Variables: {
              BUCKET_ARN: {
                "Fn::If": [
                  "IsProd",
                  { "Fn::GetAtt": ["MyBucket", "Arn"] },
                  "default-arn",
                ],
              },
            },
          },
        },
      },
    });

    const graph = transformToGraph(template);

    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0]).toMatchObject({
      source: "MyBucket",
      target: "MyFunction",
      data: { refType: "GetAtt", attribute: "Arn" },
    });
  });

  it("should detect references in deeply nested properties", () => {
    const template = createTemplate({
      MyRole: {
        Type: "AWS::IAM::Role",
        Properties: {
          AssumeRolePolicyDocument: {},
        },
      },
      MyFunction: {
        Type: "AWS::Lambda::Function",
        Properties: {
          VpcConfig: {
            SecurityGroupIds: [
              {
                "Fn::Select": [
                  0,
                  [{ Ref: "MyRole" }],
                ],
              },
            ],
          },
        },
      },
    });

    const graph = transformToGraph(template);

    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0].target).toBe("MyFunction");
  });

  it("should detect multiple references in nested structures", () => {
    const template = createTemplate({
      ResourceA: {
        Type: "AWS::S3::Bucket",
      },
      ResourceB: {
        Type: "AWS::SQS::Queue",
      },
      ResourceC: {
        Type: "AWS::Lambda::Function",
        Properties: {
          Tags: [
            {
              Key: "BucketArn",
              Value: { "Fn::GetAtt": ["ResourceA", "Arn"] },
            },
            {
              Key: "QueueUrl",
              Value: { "Fn::GetAtt": ["ResourceB", "QueueUrl"] },
            },
          ],
        },
      },
    });

    const graph = transformToGraph(template);

    expect(graph.edges).toHaveLength(2);
    expect(graph.edges.map((e) => e.source)).toEqual(
      expect.arrayContaining(["ResourceA", "ResourceB"])
    );
  });
});

// =============================================================================
// Parameter Reference Tests
// =============================================================================

describe("transformToGraph - Parameter References", () => {
  it("should not create edge for Ref to Parameter", () => {
    const template = createTemplate(
      {
        MyBucket: {
          Type: "AWS::S3::Bucket",
          Properties: {
            BucketName: { Ref: "BucketNameParam" },
          },
        },
      },
      {
        BucketNameParam: {
          Type: "String",
        },
      }
    );

    const graph = transformToGraph(template);

    expect(graph.edges).toHaveLength(0);
  });

  it("should not create edge for Ref to pseudo-parameter", () => {
    const template = createTemplate({
      MyBucket: {
        Type: "AWS::S3::Bucket",
        Properties: {
          BucketName: {
            "Fn::Sub": "${AWS::StackName}-bucket",
          },
          Tags: [
            { Key: "Region", Value: { Ref: "AWS::Region" } },
            { Key: "AccountId", Value: { Ref: "AWS::AccountId" } },
          ],
        },
      },
    });

    const graph = transformToGraph(template);

    expect(graph.edges).toHaveLength(0);
  });

  it("should create edges only for resource references", () => {
    const template = createTemplate(
      {
        MyRole: {
          Type: "AWS::IAM::Role",
          Properties: {
            AssumeRolePolicyDocument: {},
          },
        },
        MyFunction: {
          Type: "AWS::Lambda::Function",
          Properties: {
            FunctionName: { Ref: "FunctionNameParam" },
            Role: { "Fn::GetAtt": ["MyRole", "Arn"] },
          },
        },
      },
      {
        FunctionNameParam: {
          Type: "String",
        },
      }
    );

    const graph = transformToGraph(template);

    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0].target).toBe("MyFunction");
  });
});

// =============================================================================
// Edge Deduplication Tests
// =============================================================================

describe("transformToGraph - Edge Deduplication", () => {
  it("should not create duplicate edges for same reference", () => {
    const template = createTemplate({
      MyRole: {
        Type: "AWS::IAM::Role",
        Properties: {
          AssumeRolePolicyDocument: {},
        },
      },
      MyFunction: {
        Type: "AWS::Lambda::Function",
        Properties: {
          Role: { Ref: "MyRole" },
          RoleArn: { Ref: "MyRole" },
        },
      },
    });

    const graph = transformToGraph(template);

    const refEdges = graph.edges.filter(
      (e) => e.source === "MyRole" && e.target === "MyFunction" && e.data?.refType === "Ref"
    );
    expect(refEdges).toHaveLength(1);
  });

  it("should create separate edges for different ref types to same target", () => {
    const template = createTemplate({
      MyRole: {
        Type: "AWS::IAM::Role",
        Properties: {
          AssumeRolePolicyDocument: {},
        },
      },
      MyFunction: {
        Type: "AWS::Lambda::Function",
        Properties: {
          Role: { Ref: "MyRole" },
          RoleArn: { "Fn::GetAtt": ["MyRole", "Arn"] },
        },
      },
    });

    const graph = transformToGraph(template);

    expect(graph.edges).toHaveLength(2);
    expect(graph.edges.map((e) => e.data?.refType)).toEqual(
      expect.arrayContaining(["Ref", "GetAtt"])
    );
  });

  it("should create separate edges for different GetAtt attributes", () => {
    const template = createTemplate({
      MyQueue: {
        Type: "AWS::SQS::Queue",
      },
      MyFunction: {
        Type: "AWS::Lambda::Function",
        Properties: {
          Environment: {
            Variables: {
              QUEUE_ARN: { "Fn::GetAtt": ["MyQueue", "Arn"] },
              QUEUE_URL: { "Fn::GetAtt": ["MyQueue", "QueueUrl"] },
            },
          },
        },
      },
    });

    const graph = transformToGraph(template);

    const getAttEdges = graph.edges.filter((e) => e.data?.refType === "GetAtt");
    expect(getAttEdges).toHaveLength(2);
    expect(getAttEdges.map((e) => e.data?.attribute)).toEqual(
      expect.arrayContaining(["Arn", "QueueUrl"])
    );
  });
});

// =============================================================================
// Self-Reference Tests
// =============================================================================

describe("transformToGraph - Self References", () => {
  it("should not create edge for self-reference", () => {
    const template = createTemplate({
      MyBucket: {
        Type: "AWS::S3::Bucket",
        Properties: {
          // This would be unusual but should be handled
          SelfRef: { Ref: "MyBucket" },
        },
      },
    });

    const graph = transformToGraph(template);

    expect(graph.edges).toHaveLength(0);
  });
});

// =============================================================================
// Empty Template Tests
// =============================================================================

describe("transformToGraph - Edge Cases", () => {
  it("should handle template with single resource and no dependencies", () => {
    const template = createTemplate({
      MyBucket: {
        Type: "AWS::S3::Bucket",
      },
    });

    const graph = transformToGraph(template);

    expect(graph.nodes).toHaveLength(1);
    expect(graph.edges).toHaveLength(0);
  });

  it("should handle resources with no properties", () => {
    const template = createTemplate({
      ResourceA: {
        Type: "AWS::S3::Bucket",
      },
      ResourceB: {
        Type: "AWS::SQS::Queue",
        DependsOn: "ResourceA",
      },
    });

    const graph = transformToGraph(template);

    expect(graph.nodes).toHaveLength(2);
    expect(graph.edges).toHaveLength(1);
  });

  it("should ignore DependsOn to non-existent resource", () => {
    const template = createTemplate({
      MyBucket: {
        Type: "AWS::S3::Bucket",
        DependsOn: "NonExistentResource",
      },
    });

    const graph = transformToGraph(template);

    expect(graph.nodes).toHaveLength(1);
    expect(graph.edges).toHaveLength(0);
  });
});

// =============================================================================
// Edge ID Tests
// =============================================================================

describe("transformToGraph - Edge IDs", () => {
  it("should generate unique edge IDs", () => {
    const template = createTemplate({
      ResourceA: {
        Type: "AWS::S3::Bucket",
      },
      ResourceB: {
        Type: "AWS::SQS::Queue",
      },
      ResourceC: {
        Type: "AWS::Lambda::Function",
        Properties: {
          Prop1: { Ref: "ResourceA" },
          Prop2: { "Fn::GetAtt": ["ResourceB", "Arn"] },
        },
        DependsOn: "ResourceA",
      },
    });

    const graph = transformToGraph(template);

    const edgeIds = graph.edges.map((e) => e.id);
    const uniqueIds = new Set(edgeIds);
    expect(uniqueIds.size).toBe(edgeIds.length);
  });

  it("should include refType in edge ID", () => {
    const template = createTemplate({
      ResourceA: {
        Type: "AWS::S3::Bucket",
      },
      ResourceB: {
        Type: "AWS::Lambda::Function",
        Properties: {
          Prop: { Ref: "ResourceA" },
        },
      },
    });

    const graph = transformToGraph(template);

    expect(graph.edges[0].id).toContain("Ref");
  });
});

// =============================================================================
// Fn::Sub Edge Detection Tests
// =============================================================================

describe("transformToGraph - Fn::Sub Edge Detection", () => {
  it("should create edge for simple Fn::Sub with variable reference", () => {
    const template = createTemplate({
      MyBucket: {
        Type: "AWS::S3::Bucket",
      },
      MyFunction: {
        Type: "AWS::Lambda::Function",
        Properties: {
          Environment: {
            Variables: {
              BUCKET_ARN: { "Fn::Sub": "arn:aws:s3:::${MyBucket}/*" },
            },
          },
        },
      },
    });

    const graph = transformToGraph(template);

    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0]).toMatchObject({
      source: "MyBucket",
      target: "MyFunction",
      data: {
        refType: "Ref",
      },
    });
  });

  it("should create edges for Fn::Sub with multiple variable references", () => {
    const template = createTemplate({
      MyApi: {
        Type: "AWS::ApiGateway::RestApi",
      },
      MyBucket: {
        Type: "AWS::S3::Bucket",
      },
      MyFunction: {
        Type: "AWS::Lambda::Function",
        Properties: {
          Environment: {
            Variables: {
              ENDPOINT: {
                "Fn::Sub": "https://${MyApi}.execute-api.us-east-1.amazonaws.com/${MyBucket}",
              },
            },
          },
        },
      },
    });

    const graph = transformToGraph(template);

    const edges = graph.edges.filter((e) => e.target === "MyFunction");
    expect(edges).toHaveLength(2);
    expect(edges.map((e) => e.source)).toEqual(
      expect.arrayContaining(["MyApi", "MyBucket"])
    );
  });

  it("should skip AWS pseudo-parameters in Fn::Sub", () => {
    const template = createTemplate({
      MyBucket: {
        Type: "AWS::S3::Bucket",
        Properties: {
          BucketName: {
            "Fn::Sub": "${AWS::StackName}-${AWS::Region}-${AWS::AccountId}-bucket",
          },
        },
      },
    });

    const graph = transformToGraph(template);

    expect(graph.edges).toHaveLength(0);
  });

  it("should detect GetAtt-style references in Fn::Sub (dot notation)", () => {
    const template = createTemplate({
      MyQueue: {
        Type: "AWS::SQS::Queue",
      },
      MyFunction: {
        Type: "AWS::Lambda::Function",
        Properties: {
          Environment: {
            Variables: {
              QUEUE_URL: { "Fn::Sub": "The queue URL is ${MyQueue.QueueUrl}" },
            },
          },
        },
      },
    });

    const graph = transformToGraph(template);

    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0]).toMatchObject({
      source: "MyQueue",
      target: "MyFunction",
      data: {
        refType: "GetAtt",
        attribute: "QueueUrl",
      },
    });
  });

  it("should handle Fn::Sub with substitution map - Ref in map", () => {
    const template = createTemplate({
      MyBucket: {
        Type: "AWS::S3::Bucket",
      },
      MyFunction: {
        Type: "AWS::Lambda::Function",
        Properties: {
          Environment: {
            Variables: {
              BUCKET_ARN: {
                "Fn::Sub": [
                  "arn:aws:s3:::${BucketName}/*",
                  { BucketName: { Ref: "MyBucket" } },
                ],
              },
            },
          },
        },
      },
    });

    const graph = transformToGraph(template);

    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0]).toMatchObject({
      source: "MyBucket",
      target: "MyFunction",
      data: {
        refType: "Ref",
      },
    });
  });

  it("should handle Fn::Sub with substitution map - GetAtt in map", () => {
    const template = createTemplate({
      MyRole: {
        Type: "AWS::IAM::Role",
        Properties: {
          AssumeRolePolicyDocument: {},
        },
      },
      MyFunction: {
        Type: "AWS::Lambda::Function",
        Properties: {
          Environment: {
            Variables: {
              ROLE_ARN: {
                "Fn::Sub": [
                  "The role ARN is ${RoleArn}",
                  { RoleArn: { "Fn::GetAtt": ["MyRole", "Arn"] } },
                ],
              },
            },
          },
        },
      },
    });

    const graph = transformToGraph(template);

    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0]).toMatchObject({
      source: "MyRole",
      target: "MyFunction",
      data: {
        refType: "GetAtt",
        attribute: "Arn",
      },
    });
  });

  it("should handle Fn::Sub with mixed template variables and map variables", () => {
    const template = createTemplate({
      MyBucket: {
        Type: "AWS::S3::Bucket",
      },
      MyRole: {
        Type: "AWS::IAM::Role",
        Properties: {
          AssumeRolePolicyDocument: {},
        },
      },
      MyFunction: {
        Type: "AWS::Lambda::Function",
        Properties: {
          Environment: {
            Variables: {
              INFO: {
                "Fn::Sub": [
                  "Bucket: ${MyBucket}, Role: ${RoleArn}",
                  { RoleArn: { "Fn::GetAtt": ["MyRole", "Arn"] } },
                ],
              },
            },
          },
        },
      },
    });

    const graph = transformToGraph(template);

    // Should detect MyBucket from template string (not in map)
    // and MyRole from GetAtt in the map
    const edges = graph.edges.filter((e) => e.target === "MyFunction");
    expect(edges).toHaveLength(2);
    expect(edges.map((e) => e.source)).toEqual(
      expect.arrayContaining(["MyBucket", "MyRole"])
    );
  });

  it("should not create edge for variables defined in substitution map", () => {
    const template = createTemplate({
      MyBucket: {
        Type: "AWS::S3::Bucket",
      },
      MyFunction: {
        Type: "AWS::Lambda::Function",
        Properties: {
          Environment: {
            Variables: {
              // BucketName is defined in the map, so it should not create an edge
              // to a resource named "BucketName" (which doesn't exist anyway)
              BUCKET_ARN: {
                "Fn::Sub": [
                  "arn:aws:s3:::${BucketName}/*",
                  { BucketName: { Ref: "MyBucket" } },
                ],
              },
            },
          },
        },
      },
    });

    const graph = transformToGraph(template);

    // Only one edge: from MyBucket via the Ref in the map
    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0].source).toBe("MyBucket");
  });

  it("should handle complex Fn::Sub with pseudo-parameters and resource refs", () => {
    const template = createTemplate({
      MyApi: {
        Type: "AWS::ApiGateway::RestApi",
      },
      MyFunction: {
        Type: "AWS::Lambda::Function",
        Properties: {
          Environment: {
            Variables: {
              API_URL: {
                "Fn::Sub":
                  "https://${MyApi}.execute-api.${AWS::Region}.amazonaws.com/prod",
              },
            },
          },
        },
      },
    });

    const graph = transformToGraph(template);

    // Should only detect MyApi, not AWS::Region
    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0]).toMatchObject({
      source: "MyApi",
      target: "MyFunction",
      data: {
        refType: "Ref",
      },
    });
  });

  it("should handle nested Fn::Sub in other intrinsic functions", () => {
    const template = createTemplate({
      MyBucket: {
        Type: "AWS::S3::Bucket",
      },
      MyFunction: {
        Type: "AWS::Lambda::Function",
        Properties: {
          Environment: {
            Variables: {
              BUCKET_ARN: {
                "Fn::If": [
                  "IsProd",
                  { "Fn::Sub": "arn:aws:s3:::${MyBucket}/*" },
                  "default-arn",
                ],
              },
            },
          },
        },
      },
    });

    const graph = transformToGraph(template);

    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0]).toMatchObject({
      source: "MyBucket",
      target: "MyFunction",
    });
  });

  it("should deduplicate edges from same Fn::Sub variable appearing multiple times", () => {
    const template = createTemplate({
      MyBucket: {
        Type: "AWS::S3::Bucket",
      },
      MyFunction: {
        Type: "AWS::Lambda::Function",
        Properties: {
          Environment: {
            Variables: {
              ARNS: {
                "Fn::Sub": "arn:aws:s3:::${MyBucket}/* and arn:aws:s3:::${MyBucket}/subfolder/*",
              },
            },
          },
        },
      },
    });

    const graph = transformToGraph(template);

    // Should deduplicate the two references to MyBucket
    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0].source).toBe("MyBucket");
  });

  it("should skip escaped variables in Fn::Sub (literal dollar sign)", () => {
    const template = createTemplate({
      MyBucket: {
        Type: "AWS::S3::Bucket",
      },
      MyFunction: {
        Type: "AWS::Lambda::Function",
        Properties: {
          Environment: {
            Variables: {
              // ${!Literal} is escaped and should not be detected
              // ${MyBucket} should still be detected
              MIXED: { "Fn::Sub": "literal: ${!Literal}, real: ${MyBucket}" },
            },
          },
        },
      },
    });

    const graph = transformToGraph(template);

    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0].source).toBe("MyBucket");
  });
});
