/**
 * Tests for CloudFormation Type Definitions
 */

import { describe, it, expect } from 'vitest'
import {
  SERVICE_CATEGORIES,
  getAllResourceTypes,
  getAllResourceTypeStrings,
  getResourceTypesByService,
  getResourceTypeInfo,
  isValidResourceType,
  getAllServices,
  searchResourceTypes,
} from './cfn-types'

describe('cfn-types', () => {
  describe('SERVICE_CATEGORIES', () => {
    it('should have at least 8 service categories', () => {
      expect(SERVICE_CATEGORIES.length).toBeGreaterThanOrEqual(8)
    })

    it('should have compute category with Lambda and EC2', () => {
      const compute = SERVICE_CATEGORIES.find((cat) => cat.name === 'compute')
      expect(compute).toBeDefined()
      expect(compute?.types.some((t) => t.type === 'AWS::Lambda::Function')).toBe(true)
      expect(compute?.types.some((t) => t.type === 'AWS::EC2::Instance')).toBe(true)
    })

    it('should have storage category with S3', () => {
      const storage = SERVICE_CATEGORIES.find((cat) => cat.name === 'storage')
      expect(storage).toBeDefined()
      expect(storage?.types.some((t) => t.type === 'AWS::S3::Bucket')).toBe(true)
    })

    it('should have database category with DynamoDB and RDS', () => {
      const database = SERVICE_CATEGORIES.find((cat) => cat.name === 'database')
      expect(database).toBeDefined()
      expect(database?.types.some((t) => t.type === 'AWS::DynamoDB::Table')).toBe(true)
      expect(database?.types.some((t) => t.type === 'AWS::RDS::DBInstance')).toBe(true)
    })

    it('should have security category with IAM', () => {
      const security = SERVICE_CATEGORIES.find((cat) => cat.name === 'security')
      expect(security).toBeDefined()
      expect(security?.types.some((t) => t.type === 'AWS::IAM::Role')).toBe(true)
    })

    it('should have integration category with SNS and SQS', () => {
      const integration = SERVICE_CATEGORIES.find((cat) => cat.name === 'integration')
      expect(integration).toBeDefined()
      expect(integration?.types.some((t) => t.type === 'AWS::SNS::Topic')).toBe(true)
      expect(integration?.types.some((t) => t.type === 'AWS::SQS::Queue')).toBe(true)
    })
  })

  describe('getAllResourceTypes', () => {
    it('should return at least 100 resource types', () => {
      const types = getAllResourceTypes()
      expect(types.length).toBeGreaterThanOrEqual(100)
    })

    it('should return resource types with required fields', () => {
      const types = getAllResourceTypes()
      types.forEach((type) => {
        expect(type.type).toBeDefined()
        expect(type.service).toBeDefined()
        expect(type.resource).toBeDefined()
      })
    })

    it('should have unique resource types', () => {
      const types = getAllResourceTypes()
      const typeStrings = types.map((t) => t.type)
      const uniqueTypes = new Set(typeStrings)
      expect(uniqueTypes.size).toBe(typeStrings.length)
    })
  })

  describe('getAllResourceTypeStrings', () => {
    it('should return array of type strings', () => {
      const typeStrings = getAllResourceTypeStrings()
      expect(typeStrings.length).toBeGreaterThanOrEqual(100)
      expect(typeStrings.every((t) => typeof t === 'string')).toBe(true)
    })

    it('should include common AWS resource types', () => {
      const typeStrings = getAllResourceTypeStrings()
      expect(typeStrings).toContain('AWS::Lambda::Function')
      expect(typeStrings).toContain('AWS::S3::Bucket')
      expect(typeStrings).toContain('AWS::DynamoDB::Table')
      expect(typeStrings).toContain('AWS::IAM::Role')
      expect(typeStrings).toContain('AWS::SNS::Topic')
      expect(typeStrings).toContain('AWS::SQS::Queue')
    })
  })

  describe('getResourceTypesByService', () => {
    it('should return Lambda resource types', () => {
      const lambdaTypes = getResourceTypesByService('Lambda')
      expect(lambdaTypes.length).toBeGreaterThan(0)
      expect(lambdaTypes.every((t) => t.service === 'Lambda')).toBe(true)
      expect(lambdaTypes.some((t) => t.type === 'AWS::Lambda::Function')).toBe(true)
    })

    it('should return S3 resource types', () => {
      const s3Types = getResourceTypesByService('S3')
      expect(s3Types.length).toBeGreaterThan(0)
      expect(s3Types.every((t) => t.service === 'S3')).toBe(true)
    })

    it('should return empty array for unknown service', () => {
      const types = getResourceTypesByService('UnknownService')
      expect(types).toEqual([])
    })
  })

  describe('getResourceTypeInfo', () => {
    it('should return info for Lambda Function', () => {
      const info = getResourceTypeInfo('AWS::Lambda::Function')
      expect(info).toBeDefined()
      expect(info?.type).toBe('AWS::Lambda::Function')
      expect(info?.service).toBe('Lambda')
      expect(info?.resource).toBe('Function')
      expect(info?.commonProperties).toBeDefined()
    })

    it('should return info for S3 Bucket', () => {
      const info = getResourceTypeInfo('AWS::S3::Bucket')
      expect(info).toBeDefined()
      expect(info?.type).toBe('AWS::S3::Bucket')
      expect(info?.service).toBe('S3')
    })

    it('should return undefined for unknown type', () => {
      const info = getResourceTypeInfo('AWS::Unknown::Resource')
      expect(info).toBeUndefined()
    })
  })

  describe('isValidResourceType', () => {
    it('should return true for valid types', () => {
      expect(isValidResourceType('AWS::Lambda::Function')).toBe(true)
      expect(isValidResourceType('AWS::S3::Bucket')).toBe(true)
      expect(isValidResourceType('AWS::DynamoDB::Table')).toBe(true)
    })

    it('should return false for invalid types', () => {
      expect(isValidResourceType('AWS::Unknown::Resource')).toBe(false)
      expect(isValidResourceType('InvalidType')).toBe(false)
      expect(isValidResourceType('')).toBe(false)
    })
  })

  describe('getAllServices', () => {
    it('should return array of service names', () => {
      const services = getAllServices()
      expect(services.length).toBeGreaterThan(0)
      expect(services.every((s) => typeof s === 'string')).toBe(true)
    })

    it('should include common AWS services', () => {
      const services = getAllServices()
      expect(services).toContain('Lambda')
      expect(services).toContain('S3')
      expect(services).toContain('DynamoDB')
      expect(services).toContain('IAM')
      expect(services).toContain('SNS')
      expect(services).toContain('SQS')
    })

    it('should return sorted services', () => {
      const services = getAllServices()
      const sorted = [...services].sort()
      expect(services).toEqual(sorted)
    })

    it('should have unique service names', () => {
      const services = getAllServices()
      const uniqueServices = new Set(services)
      expect(uniqueServices.size).toBe(services.length)
    })
  })

  describe('searchResourceTypes', () => {
    it('should find Lambda resources by service name', () => {
      const results = searchResourceTypes('lambda')
      expect(results.length).toBeGreaterThan(0)
      expect(results.every((r) => r.service === 'Lambda')).toBe(true)
    })

    it('should find S3 resources by service name', () => {
      const results = searchResourceTypes('s3')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some((r) => r.type === 'AWS::S3::Bucket')).toBe(true)
    })

    it('should find resources by resource name', () => {
      const results = searchResourceTypes('function')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some((r) => r.type === 'AWS::Lambda::Function')).toBe(true)
    })

    it('should find resources by full type', () => {
      const results = searchResourceTypes('AWS::DynamoDB::Table')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some((r) => r.type === 'AWS::DynamoDB::Table')).toBe(true)
    })

    it('should be case-insensitive', () => {
      const lowerResults = searchResourceTypes('lambda')
      const upperResults = searchResourceTypes('LAMBDA')
      const mixedResults = searchResourceTypes('LaMbDa')
      expect(lowerResults).toEqual(upperResults)
      expect(lowerResults).toEqual(mixedResults)
    })

    it('should return empty array for no matches', () => {
      const results = searchResourceTypes('xyznonexistent')
      expect(results).toEqual([])
    })
  })
})
