/**
 * Resource Grouping Tests
 */

import { describe, it, expect } from 'vitest'
import type { CfnNode } from '@/types/graph'
import {
  extractServiceName,
  getServiceLabel,
  getServiceColor,
  groupNodesByService,
  getNodeGroup,
  isNodeGrouped,
} from './resource-grouping'

// =============================================================================
// Test Helpers
// =============================================================================

function createTestNode(id: string, resourceType: string): CfnNode {
  return {
    id,
    type: 'cfnResource',
    position: { x: 0, y: 0 },
    data: {
      logicalId: id,
      resourceType,
      properties: {},
    },
  }
}

// =============================================================================
// Service Extraction Tests
// =============================================================================

describe('extractServiceName', () => {
  it('should extract service from AWS resource type', () => {
    expect(extractServiceName('AWS::Lambda::Function')).toBe('Lambda')
    expect(extractServiceName('AWS::S3::Bucket')).toBe('S3')
    expect(extractServiceName('AWS::DynamoDB::Table')).toBe('DynamoDB')
  })

  it('should handle non-AWS resources', () => {
    expect(extractServiceName('Custom::Resource')).toBe('Other')
    expect(extractServiceName('SomeOtherType')).toBe('Other')
  })

  it('should handle malformed types', () => {
    expect(extractServiceName('AWS')).toBe('Other')
    expect(extractServiceName('')).toBe('Other')
  })
})

describe('getServiceLabel', () => {
  it('should format service label with count', () => {
    expect(getServiceLabel('Lambda', 3)).toBe('Lambda (3)')
    expect(getServiceLabel('S3', 1)).toBe('S3 (1)')
  })
})

describe('getServiceColor', () => {
  it('should return color for known services', () => {
    expect(getServiceColor('Lambda')).toBe('#ff9900')
    expect(getServiceColor('S3')).toBe('#569a31')
    expect(getServiceColor('DynamoDB')).toBe('#4053d6')
  })

  it('should return default color for unknown services', () => {
    expect(getServiceColor('UnknownService')).toBe('#687078')
    expect(getServiceColor('Other')).toBe('#687078')
  })
})

// =============================================================================
// Grouping Logic Tests
// =============================================================================

describe('groupNodesByService', () => {
  it('should group nodes by service type', () => {
    const nodes: CfnNode[] = [
      createTestNode('Fn1', 'AWS::Lambda::Function'),
      createTestNode('Fn2', 'AWS::Lambda::Function'),
      createTestNode('Bucket1', 'AWS::S3::Bucket'),
      createTestNode('Bucket2', 'AWS::S3::Bucket'),
      createTestNode('Table1', 'AWS::DynamoDB::Table'),
    ]

    const groups = groupNodesByService(nodes, { enabled: true, minGroupSize: 2 })

    expect(groups).toHaveLength(2) // Lambda and S3 (DynamoDB only has 1)
    expect(groups.find((g) => g.service === 'Lambda')?.nodeIds).toEqual(['Fn1', 'Fn2'])
    expect(groups.find((g) => g.service === 'S3')?.nodeIds).toEqual(['Bucket1', 'Bucket2'])
  })

  it('should respect minimum group size', () => {
    const nodes: CfnNode[] = [
      createTestNode('Fn1', 'AWS::Lambda::Function'),
      createTestNode('Fn2', 'AWS::Lambda::Function'),
      createTestNode('Bucket1', 'AWS::S3::Bucket'),
    ]

    const groups = groupNodesByService(nodes, { enabled: true, minGroupSize: 2 })

    expect(groups).toHaveLength(1) // Only Lambda has 2+ nodes
    expect(groups[0].service).toBe('Lambda')
  })

  it('should return empty array when grouping disabled', () => {
    const nodes: CfnNode[] = [
      createTestNode('Fn1', 'AWS::Lambda::Function'),
      createTestNode('Fn2', 'AWS::Lambda::Function'),
    ]

    const groups = groupNodesByService(nodes, { enabled: false })

    expect(groups).toHaveLength(0)
  })

  it('should sort groups by size descending', () => {
    const nodes: CfnNode[] = [
      createTestNode('Fn1', 'AWS::Lambda::Function'),
      createTestNode('Fn2', 'AWS::Lambda::Function'),
      createTestNode('Bucket1', 'AWS::S3::Bucket'),
      createTestNode('Bucket2', 'AWS::S3::Bucket'),
      createTestNode('Bucket3', 'AWS::S3::Bucket'),
    ]

    const groups = groupNodesByService(nodes, { enabled: true, minGroupSize: 2 })

    expect(groups[0].service).toBe('S3') // 3 nodes
    expect(groups[1].service).toBe('Lambda') // 2 nodes
  })

  it('should include correct metadata in groups', () => {
    const nodes: CfnNode[] = [
      createTestNode('Fn1', 'AWS::Lambda::Function'),
      createTestNode('Fn2', 'AWS::Lambda::Function'),
    ]

    const groups = groupNodesByService(nodes, { enabled: true, minGroupSize: 2 })

    expect(groups[0]).toMatchObject({
      service: 'Lambda',
      label: 'Lambda (2)',
      nodeIds: ['Fn1', 'Fn2'],
      color: '#ff9900',
    })
  })
})

describe('getNodeGroup', () => {
  const nodes: CfnNode[] = [
    createTestNode('Fn1', 'AWS::Lambda::Function'),
    createTestNode('Fn2', 'AWS::Lambda::Function'),
    createTestNode('Bucket1', 'AWS::S3::Bucket'),
  ]

  const groups = groupNodesByService(nodes, { enabled: true, minGroupSize: 2 })

  it('should find group for a node', () => {
    const group = getNodeGroup('Fn1', groups)
    expect(group?.service).toBe('Lambda')
  })

  it('should return undefined for ungrouped node', () => {
    const group = getNodeGroup('Bucket1', groups)
    expect(group).toBeUndefined()
  })

  it('should return undefined for non-existent node', () => {
    const group = getNodeGroup('NonExistent', groups)
    expect(group).toBeUndefined()
  })
})

describe('isNodeGrouped', () => {
  const nodes: CfnNode[] = [
    createTestNode('Fn1', 'AWS::Lambda::Function'),
    createTestNode('Fn2', 'AWS::Lambda::Function'),
    createTestNode('Bucket1', 'AWS::S3::Bucket'),
  ]

  const groups = groupNodesByService(nodes, { enabled: true, minGroupSize: 2 })

  it('should return true for grouped node', () => {
    expect(isNodeGrouped('Fn1', groups)).toBe(true)
    expect(isNodeGrouped('Fn2', groups)).toBe(true)
  })

  it('should return false for ungrouped node', () => {
    expect(isNodeGrouped('Bucket1', groups)).toBe(false)
  })

  it('should return false for non-existent node', () => {
    expect(isNodeGrouped('NonExistent', groups)).toBe(false)
  })
})
