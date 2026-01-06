/**
 * CloudFormation Parser Tests
 */

import { describe, it, expect } from "vitest";
import {
  parseTemplate,
  getResourceIds,
  getResource,
  getResourcesByType,
  getResourceTypes,
  getResourceDependencies,
  getParameterNames,
  getOutputNames,
} from "@/lib/parser";
import type { CloudFormationTemplate } from "@/types/cloudformation";

// =============================================================================
// Test Fixtures
// =============================================================================

const MINIMAL_TEMPLATE = JSON.stringify({
  Resources: {
    MyBucket: {
      Type: "AWS::S3::Bucket",
    },
  },
});

const FULL_TEMPLATE = JSON.stringify({
  AWSTemplateFormatVersion: "2010-09-09",
  Description: "A comprehensive test template",
  Parameters: {
    Environment: {
      Type: "String",
      Default: "dev",
      AllowedValues: ["dev", "staging", "prod"],
      Description: "Deployment environment",
    },
    BucketName: {
      Type: "String",
      MinLength: 3,
      MaxLength: 63,
    },
  },
  Mappings: {
    RegionMap: {
      "us-east-1": {
        AMI: "ami-12345678",
        InstanceType: "t3.micro",
      },
      "us-west-2": {
        AMI: "ami-87654321",
        InstanceType: "t3.small",
      },
    },
  },
  Conditions: {
    IsProd: {
      "Fn::Equals": [{ Ref: "Environment" }, "prod"],
    },
  },
  Resources: {
    MyBucket: {
      Type: "AWS::S3::Bucket",
      Properties: {
        BucketName: { Ref: "BucketName" },
        Tags: [
          {
            Key: "Environment",
            Value: { Ref: "Environment" },
          },
        ],
      },
    },
    MyQueue: {
      Type: "AWS::SQS::Queue",
      DependsOn: "MyBucket",
      Properties: {
        QueueName: {
          "Fn::Sub": "${Environment}-my-queue",
        },
      },
    },
    MyLambda: {
      Type: "AWS::Lambda::Function",
      DependsOn: ["MyBucket", "MyQueue"],
      Condition: "IsProd",
      Properties: {
        FunctionName: {
          "Fn::Join": ["-", [{ Ref: "Environment" }, "processor"]],
        },
        Handler: "index.handler",
        Runtime: "nodejs18.x",
        Environment: {
          Variables: {
            BUCKET_NAME: { "Fn::GetAtt": ["MyBucket", "Arn"] },
            QUEUE_URL: { "Fn::GetAtt": ["MyQueue", "QueueUrl"] },
          },
        },
      },
    },
  },
  Outputs: {
    BucketArn: {
      Description: "ARN of the S3 bucket",
      Value: { "Fn::GetAtt": ["MyBucket", "Arn"] },
      Export: {
        Name: { "Fn::Sub": "${AWS::StackName}-BucketArn" },
      },
    },
    QueueUrl: {
      Value: { Ref: "MyQueue" },
      Condition: "IsProd",
    },
  },
});

const TEMPLATE_WITH_INTRINSICS = JSON.stringify({
  Resources: {
    MyResource: {
      Type: "AWS::CloudFormation::WaitConditionHandle",
      Properties: {
        RefExample: { Ref: "SomeParameter" },
        GetAttExample: { "Fn::GetAtt": ["OtherResource", "Arn"] },
        SubExample: { "Fn::Sub": "arn:aws:s3:::${BucketName}/*" },
        SubWithMap: {
          "Fn::Sub": [
            "arn:aws:s3:::${Bucket}/${Key}",
            {
              Bucket: { Ref: "BucketName" },
              Key: "my-key",
            },
          ],
        },
        JoinExample: {
          "Fn::Join": [":", ["a", "b", "c"]],
        },
        SelectExample: {
          "Fn::Select": [0, ["a", "b", "c"]],
        },
        SplitExample: {
          "Fn::Split": [",", "a,b,c"],
        },
        Base64Example: {
          "Fn::Base64": "Hello World",
        },
        FindInMapExample: {
          "Fn::FindInMap": ["RegionMap", { Ref: "AWS::Region" }, "AMI"],
        },
        GetAZsExample: {
          "Fn::GetAZs": { Ref: "AWS::Region" },
        },
        ImportValueExample: {
          "Fn::ImportValue": "SharedVpcId",
        },
        IfExample: {
          "Fn::If": ["IsProd", "prod-value", "dev-value"],
        },
        ConditionExample: {
          Condition: "IsProd",
        },
        NestedIntrinsics: {
          "Fn::Join": [
            "-",
            [
              { Ref: "Environment" },
              { "Fn::Select": [0, { "Fn::Split": [",", "a,b,c"] }] },
            ],
          ],
        },
      },
    },
  },
});

// =============================================================================
// Parsing Tests
// =============================================================================

describe("parseTemplate", () => {
  describe("valid templates", () => {
    it("should parse a minimal valid template", () => {
      const result = parseTemplate(MINIMAL_TEMPLATE);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.template.Resources).toBeDefined();
        expect(result.template.Resources.MyBucket).toBeDefined();
        expect(result.template.Resources.MyBucket.Type).toBe("AWS::S3::Bucket");
      }
    });

    it("should parse a full template with all sections", () => {
      const result = parseTemplate(FULL_TEMPLATE);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.template.AWSTemplateFormatVersion).toBe("2010-09-09");
        expect(result.template.Description).toBe("A comprehensive test template");
        expect(result.template.Parameters).toBeDefined();
        expect(result.template.Mappings).toBeDefined();
        expect(result.template.Conditions).toBeDefined();
        expect(result.template.Resources).toBeDefined();
        expect(result.template.Outputs).toBeDefined();
      }
    });

    it("should parse template with Transform section", () => {
      const template = JSON.stringify({
        Transform: "AWS::Serverless-2016-10-31",
        Resources: {
          MyFunction: {
            Type: "AWS::Serverless::Function",
            Properties: {
              Handler: "index.handler",
              Runtime: "nodejs18.x",
            },
          },
        },
      });

      const result = parseTemplate(template);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.template.Transform).toBe("AWS::Serverless-2016-10-31");
      }
    });

    it("should parse template with multiple transforms as array", () => {
      const template = JSON.stringify({
        Transform: ["AWS::Serverless-2016-10-31", "AWS::Include"],
        Resources: {
          MyResource: {
            Type: "AWS::CloudFormation::WaitConditionHandle",
          },
        },
      });

      const result = parseTemplate(template);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.template.Transform).toEqual([
          "AWS::Serverless-2016-10-31",
          "AWS::Include",
        ]);
      }
    });
  });

  describe("intrinsic function preservation", () => {
    it("should preserve Ref intrinsic functions", () => {
      const result = parseTemplate(TEMPLATE_WITH_INTRINSICS);

      expect(result.success).toBe(true);
      if (result.success) {
        const props = result.template.Resources.MyResource.Properties;
        expect(props?.RefExample).toEqual({ Ref: "SomeParameter" });
      }
    });

    it("should preserve Fn::GetAtt intrinsic functions", () => {
      const result = parseTemplate(TEMPLATE_WITH_INTRINSICS);

      expect(result.success).toBe(true);
      if (result.success) {
        const props = result.template.Resources.MyResource.Properties;
        expect(props?.GetAttExample).toEqual({
          "Fn::GetAtt": ["OtherResource", "Arn"],
        });
      }
    });

    it("should preserve Fn::Sub intrinsic functions", () => {
      const result = parseTemplate(TEMPLATE_WITH_INTRINSICS);

      expect(result.success).toBe(true);
      if (result.success) {
        const props = result.template.Resources.MyResource.Properties;
        expect(props?.SubExample).toEqual({
          "Fn::Sub": "arn:aws:s3:::${BucketName}/*",
        });
        expect(props?.SubWithMap).toEqual({
          "Fn::Sub": [
            "arn:aws:s3:::${Bucket}/${Key}",
            {
              Bucket: { Ref: "BucketName" },
              Key: "my-key",
            },
          ],
        });
      }
    });

    it("should preserve Fn::Join intrinsic functions", () => {
      const result = parseTemplate(TEMPLATE_WITH_INTRINSICS);

      expect(result.success).toBe(true);
      if (result.success) {
        const props = result.template.Resources.MyResource.Properties;
        expect(props?.JoinExample).toEqual({
          "Fn::Join": [":", ["a", "b", "c"]],
        });
      }
    });

    it("should preserve nested intrinsic functions", () => {
      const result = parseTemplate(TEMPLATE_WITH_INTRINSICS);

      expect(result.success).toBe(true);
      if (result.success) {
        const props = result.template.Resources.MyResource.Properties;
        expect(props?.NestedIntrinsics).toEqual({
          "Fn::Join": [
            "-",
            [
              { Ref: "Environment" },
              { "Fn::Select": [0, { "Fn::Split": [",", "a,b,c"] }] },
            ],
          ],
        });
      }
    });

    it("should preserve Fn::If conditional functions", () => {
      const result = parseTemplate(TEMPLATE_WITH_INTRINSICS);

      expect(result.success).toBe(true);
      if (result.success) {
        const props = result.template.Resources.MyResource.Properties;
        expect(props?.IfExample).toEqual({
          "Fn::If": ["IsProd", "prod-value", "dev-value"],
        });
      }
    });

    it("should preserve all other intrinsic functions", () => {
      const result = parseTemplate(TEMPLATE_WITH_INTRINSICS);

      expect(result.success).toBe(true);
      if (result.success) {
        const props = result.template.Resources.MyResource.Properties;
        expect(props?.SelectExample).toEqual({
          "Fn::Select": [0, ["a", "b", "c"]],
        });
        expect(props?.SplitExample).toEqual({
          "Fn::Split": [",", "a,b,c"],
        });
        expect(props?.Base64Example).toEqual({
          "Fn::Base64": "Hello World",
        });
        expect(props?.FindInMapExample).toEqual({
          "Fn::FindInMap": ["RegionMap", { Ref: "AWS::Region" }, "AMI"],
        });
        expect(props?.GetAZsExample).toEqual({
          "Fn::GetAZs": { Ref: "AWS::Region" },
        });
        expect(props?.ImportValueExample).toEqual({
          "Fn::ImportValue": "SharedVpcId",
        });
        expect(props?.ConditionExample).toEqual({
          Condition: "IsProd",
        });
      }
    });
  });

  describe("invalid JSON handling", () => {
    it("should return error for invalid JSON syntax", () => {
      const result = parseTemplate("{invalid json}");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toMatch(/Invalid JSON/);
      }
    });

    it("should return error for empty input", () => {
      const result = parseTemplate("");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Input is empty or contains only whitespace.");
      }
    });

    it("should return error for whitespace-only input", () => {
      const result = parseTemplate("   \n\t  ");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Input is empty or contains only whitespace.");
      }
    });

    it("should return error for JSON array instead of object", () => {
      const result = parseTemplate("[]");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Template must be a JSON object.");
      }
    });

    it("should return error for JSON primitive", () => {
      const result = parseTemplate('"just a string"');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Template must be a JSON object.");
      }
    });

    it("should return error for null", () => {
      const result = parseTemplate("null");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Template must be a JSON object.");
      }
    });

    it("should return error for truncated JSON", () => {
      const result = parseTemplate('{"Resources": {');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toMatch(/Invalid JSON/);
      }
    });
  });

  describe("missing Resources handling", () => {
    it("should return error when Resources is missing", () => {
      const template = JSON.stringify({
        AWSTemplateFormatVersion: "2010-09-09",
        Description: "Template without resources",
      });

      const result = parseTemplate(template);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Template is missing required 'Resources' section.");
      }
    });

    it("should return error when Resources is empty", () => {
      const template = JSON.stringify({
        Resources: {},
      });

      const result = parseTemplate(template);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Resources section must contain at least one resource.");
      }
    });

    it("should return error when Resources is not an object", () => {
      const template = JSON.stringify({
        Resources: ["not", "an", "object"],
      });

      const result = parseTemplate(template);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Resources section must be an object.");
      }
    });
  });

  describe("resource validation", () => {
    it("should return error for resource without Type", () => {
      const template = JSON.stringify({
        Resources: {
          MyResource: {
            Properties: {
              Name: "test",
            },
          },
        },
      });

      const result = parseTemplate(template);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(
          'Resource "MyResource" is missing required "Type" property.'
        );
      }
    });

    it("should return error for resource with non-string Type", () => {
      const template = JSON.stringify({
        Resources: {
          MyResource: {
            Type: 123,
          },
        },
      });

      const result = parseTemplate(template);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(
          'Resource "MyResource" has invalid Type: must be a string.'
        );
      }
    });

    it("should return error for resource with empty Type", () => {
      const template = JSON.stringify({
        Resources: {
          MyResource: {
            Type: "",
          },
        },
      });

      const result = parseTemplate(template);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Resource "MyResource" has empty Type.');
      }
    });

    it("should return error for invalid logical ID starting with number", () => {
      const template = JSON.stringify({
        Resources: {
          "123InvalidId": {
            Type: "AWS::S3::Bucket",
          },
        },
      });

      const result = parseTemplate(template);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toMatch(/Invalid resource logical ID "123InvalidId"/);
      }
    });

    it("should return error for invalid logical ID with special characters", () => {
      const template = JSON.stringify({
        Resources: {
          "My-Resource": {
            Type: "AWS::S3::Bucket",
          },
        },
      });

      const result = parseTemplate(template);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toMatch(/Invalid resource logical ID "My-Resource"/);
      }
    });

    it("should accept valid DependsOn as string", () => {
      const template = JSON.stringify({
        Resources: {
          First: {
            Type: "AWS::S3::Bucket",
          },
          Second: {
            Type: "AWS::S3::Bucket",
            DependsOn: "First",
          },
        },
      });

      const result = parseTemplate(template);
      expect(result.success).toBe(true);
    });

    it("should accept valid DependsOn as array", () => {
      const template = JSON.stringify({
        Resources: {
          First: {
            Type: "AWS::S3::Bucket",
          },
          Second: {
            Type: "AWS::S3::Bucket",
          },
          Third: {
            Type: "AWS::S3::Bucket",
            DependsOn: ["First", "Second"],
          },
        },
      });

      const result = parseTemplate(template);
      expect(result.success).toBe(true);
    });

    it("should return error for invalid DependsOn type", () => {
      const template = JSON.stringify({
        Resources: {
          First: {
            Type: "AWS::S3::Bucket",
          },
          Second: {
            Type: "AWS::S3::Bucket",
            DependsOn: 123,
          },
        },
      });

      const result = parseTemplate(template);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toMatch(/invalid DependsOn/);
      }
    });
  });

  describe("template version validation", () => {
    it("should accept valid template version", () => {
      const template = JSON.stringify({
        AWSTemplateFormatVersion: "2010-09-09",
        Resources: {
          MyResource: {
            Type: "AWS::S3::Bucket",
          },
        },
      });

      const result = parseTemplate(template);
      expect(result.success).toBe(true);
    });

    it("should return error for invalid template version", () => {
      const template = JSON.stringify({
        AWSTemplateFormatVersion: "2020-01-01",
        Resources: {
          MyResource: {
            Type: "AWS::S3::Bucket",
          },
        },
      });

      const result = parseTemplate(template);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toMatch(/Invalid AWSTemplateFormatVersion/);
      }
    });
  });

  describe("description validation", () => {
    it("should return error for non-string description", () => {
      const template = JSON.stringify({
        Description: 123,
        Resources: {
          MyResource: {
            Type: "AWS::S3::Bucket",
          },
        },
      });

      const result = parseTemplate(template);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Description must be a string, got number.");
      }
    });

    it("should return error for description exceeding max length", () => {
      const longDescription = "a".repeat(1025);
      const template = JSON.stringify({
        Description: longDescription,
        Resources: {
          MyResource: {
            Type: "AWS::S3::Bucket",
          },
        },
      });

      const result = parseTemplate(template);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toMatch(/Description exceeds maximum length/);
      }
    });
  });

  describe("parameter validation", () => {
    it("should return error for parameter without Type", () => {
      const template = JSON.stringify({
        Parameters: {
          MyParam: {
            Default: "value",
          },
        },
        Resources: {
          MyResource: {
            Type: "AWS::S3::Bucket",
          },
        },
      });

      const result = parseTemplate(template);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(
          'Parameter "MyParam" is missing required "Type" property.'
        );
      }
    });

    it("should return error for parameter with non-string Type", () => {
      const template = JSON.stringify({
        Parameters: {
          MyParam: {
            Type: 123,
          },
        },
        Resources: {
          MyResource: {
            Type: "AWS::S3::Bucket",
          },
        },
      });

      const result = parseTemplate(template);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(
          'Parameter "MyParam" has invalid Type: must be a string.'
        );
      }
    });
  });

  describe("output validation", () => {
    it("should return error for output without Value", () => {
      const template = JSON.stringify({
        Resources: {
          MyResource: {
            Type: "AWS::S3::Bucket",
          },
        },
        Outputs: {
          MyOutput: {
            Description: "An output without a value",
          },
        },
      });

      const result = parseTemplate(template);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(
          'Output "MyOutput" is missing required "Value" property.'
        );
      }
    });
  });

  describe("unknown key validation", () => {
    it("should return error for unknown top-level keys", () => {
      const template = JSON.stringify({
        Resources: {
          MyResource: {
            Type: "AWS::S3::Bucket",
          },
        },
        UnknownSection: {
          foo: "bar",
        },
      });

      const result = parseTemplate(template);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toMatch(/Unknown top-level keys.*UnknownSection/);
      }
    });
  });
});

// =============================================================================
// Utility Function Tests
// =============================================================================

describe("utility functions", () => {
  let template: CloudFormationTemplate;

  beforeEach(() => {
    const result = parseTemplate(FULL_TEMPLATE);
    if (!result.success) {
      throw new Error("Failed to parse test template");
    }
    template = result.template;
  });

  describe("getResourceIds", () => {
    it("should return all resource logical IDs", () => {
      const ids = getResourceIds(template);

      expect(ids).toEqual(["MyBucket", "MyQueue", "MyLambda"]);
    });
  });

  describe("getResource", () => {
    it("should return resource by logical ID", () => {
      const resource = getResource(template, "MyBucket");

      expect(resource).toBeDefined();
      expect(resource?.Type).toBe("AWS::S3::Bucket");
    });

    it("should return undefined for non-existent resource", () => {
      const resource = getResource(template, "NonExistent");

      expect(resource).toBeUndefined();
    });
  });

  describe("getResourcesByType", () => {
    it("should return resources matching type", () => {
      const buckets = getResourcesByType(template, "AWS::S3::Bucket");

      expect(Object.keys(buckets)).toEqual(["MyBucket"]);
    });

    it("should return empty object for non-matching type", () => {
      const instances = getResourcesByType(template, "AWS::EC2::Instance");

      expect(Object.keys(instances)).toEqual([]);
    });
  });

  describe("getResourceTypes", () => {
    it("should return all unique resource types sorted", () => {
      const types = getResourceTypes(template);

      expect(types).toEqual([
        "AWS::Lambda::Function",
        "AWS::S3::Bucket",
        "AWS::SQS::Queue",
      ]);
    });
  });

  describe("getResourceDependencies", () => {
    it("should return single dependency as array", () => {
      const deps = getResourceDependencies(template, "MyQueue");

      expect(deps).toEqual(["MyBucket"]);
    });

    it("should return multiple dependencies", () => {
      const deps = getResourceDependencies(template, "MyLambda");

      expect(deps).toEqual(["MyBucket", "MyQueue"]);
    });

    it("should return empty array for resource without dependencies", () => {
      const deps = getResourceDependencies(template, "MyBucket");

      expect(deps).toEqual([]);
    });

    it("should return empty array for non-existent resource", () => {
      const deps = getResourceDependencies(template, "NonExistent");

      expect(deps).toEqual([]);
    });
  });

  describe("getParameterNames", () => {
    it("should return all parameter names", () => {
      const names = getParameterNames(template);

      expect(names).toEqual(["Environment", "BucketName"]);
    });

    it("should return empty array for template without parameters", () => {
      const minimalResult = parseTemplate(MINIMAL_TEMPLATE);
      if (!minimalResult.success) {
        throw new Error("Failed to parse minimal template");
      }

      const names = getParameterNames(minimalResult.template);

      expect(names).toEqual([]);
    });
  });

  describe("getOutputNames", () => {
    it("should return all output names", () => {
      const names = getOutputNames(template);

      expect(names).toEqual(["BucketArn", "QueueUrl"]);
    });

    it("should return empty array for template without outputs", () => {
      const minimalResult = parseTemplate(MINIMAL_TEMPLATE);
      if (!minimalResult.success) {
        throw new Error("Failed to parse minimal template");
      }

      const names = getOutputNames(minimalResult.template);

      expect(names).toEqual([]);
    });
  });
});
