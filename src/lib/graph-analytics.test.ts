/**
 * Graph Analytics Tests
 */

import { describe, it, expect } from 'vitest'
import type { CfnEdge, CfnNode } from '@/types/graph'
import { findDependencyPaths, calculateGraphMetrics } from './graph-analytics'

// =============================================================================
// Test Helpers
// =============================================================================

function createTestEdge(id: string, source: string, target: string): CfnEdge {
  return {
    id,
    source,
    target,
    type: 'default',
  }
}

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
// Dependency Path Tests
// =============================================================================

describe('findDependencyPaths', () => {
  it('should find direct upstream and downstream dependencies', () => {
    const edges: CfnEdge[] = [
      createTestEdge('e1', 'B', 'A'), // A depends on B (B -> A)
      createTestEdge('e2', 'C', 'B'), // B depends on C (C -> B)
    ]

    const paths = findDependencyPaths('B', edges)

    expect(paths.upstream).toContain('C') // B depends on C
    expect(paths.downstream).toContain('A') // A depends on B
    expect(paths.edgeIds).toContain('e1')
    expect(paths.edgeIds).toContain('e2')
  })

  it('should find transitive dependencies', () => {
    const edges: CfnEdge[] = [
      createTestEdge('e1', 'B', 'A'), // A depends on B
      createTestEdge('e2', 'C', 'B'), // B depends on C
      createTestEdge('e3', 'D', 'C'), // C depends on D
    ]

    const paths = findDependencyPaths('B', edges)

    expect(paths.upstream).toContain('C')
    expect(paths.upstream).toContain('D') // Transitive through C
    expect(paths.downstream).toContain('A')
  })

  it('should handle nodes with no dependencies', () => {
    const edges: CfnEdge[] = [createTestEdge('e1', 'A', 'B'), createTestEdge('e2', 'B', 'C')]

    const paths = findDependencyPaths('D', edges)

    expect(paths.upstream.size).toBe(0)
    expect(paths.downstream.size).toBe(0)
    expect(paths.edgeIds.size).toBe(0)
  })

  it('should handle leaf nodes (no upstream)', () => {
    const edges: CfnEdge[] = [
      createTestEdge('e1', 'B', 'A'), // A depends on B
      createTestEdge('e2', 'B', 'C'), // C depends on B
    ]

    const paths = findDependencyPaths('B', edges)

    expect(paths.upstream.size).toBe(0) // B is a leaf (no dependencies)
    expect(paths.downstream).toContain('A')
    expect(paths.downstream).toContain('C')
  })

  it('should handle root nodes (no downstream)', () => {
    const edges: CfnEdge[] = [
      createTestEdge('e1', 'B', 'A'), // A depends on B
      createTestEdge('e2', 'C', 'A'), // A depends on C
    ]

    const paths = findDependencyPaths('A', edges)

    expect(paths.upstream).toContain('B')
    expect(paths.upstream).toContain('C')
    expect(paths.downstream.size).toBe(0) // A is a root (nothing depends on A)
  })

  it('should handle cycles gracefully', () => {
    const edges: CfnEdge[] = [
      createTestEdge('e1', 'A', 'B'),
      createTestEdge('e2', 'B', 'C'),
      createTestEdge('e3', 'C', 'A'), // Cycle: A -> B -> C -> A
    ]

    const paths = findDependencyPaths('A', edges)

    expect(paths.upstream).toContain('B')
    expect(paths.upstream).toContain('C')
    expect(paths.downstream).toContain('C') // Through cycle
  })

  it('should handle complex dependency graphs', () => {
    const edges: CfnEdge[] = [
      createTestEdge('e1', 'D', 'A'), // A depends on D
      createTestEdge('e2', 'D', 'B'), // B depends on D
      createTestEdge('e3', 'D', 'C'), // C depends on D
      createTestEdge('e4', 'E', 'D'), // D depends on E
      createTestEdge('e5', 'F', 'D'), // D depends on F
    ]

    const paths = findDependencyPaths('D', edges)

    // D depends on E and F
    expect(paths.upstream).toContain('E')
    expect(paths.upstream).toContain('F')

    // A, B, C depend on D
    expect(paths.downstream).toContain('A')
    expect(paths.downstream).toContain('B')
    expect(paths.downstream).toContain('C')
  })

  it('should not include the node itself in paths', () => {
    const edges: CfnEdge[] = [createTestEdge('e1', 'A', 'B'), createTestEdge('e2', 'B', 'C')]

    const paths = findDependencyPaths('B', edges)

    expect(paths.upstream).not.toContain('B')
    expect(paths.downstream).not.toContain('B')
  })

  it('should collect all relevant edge IDs', () => {
    const edges: CfnEdge[] = [
      createTestEdge('e1', 'A', 'B'),
      createTestEdge('e2', 'B', 'C'),
      createTestEdge('e3', 'X', 'Y'), // Unrelated edge
    ]

    const paths = findDependencyPaths('B', edges)

    expect(paths.edgeIds).toContain('e1')
    expect(paths.edgeIds).toContain('e2')
    expect(paths.edgeIds).not.toContain('e3')
  })
})

// =============================================================================
// Graph Metrics Tests
// =============================================================================

describe('calculateGraphMetrics', () => {
  it('should calculate basic metrics for simple graph', () => {
    const nodes: CfnNode[] = [
      createTestNode('A', 'AWS::Lambda::Function'),
      createTestNode('B', 'AWS::S3::Bucket'),
      createTestNode('C', 'AWS::DynamoDB::Table'),
    ]

    const edges: CfnEdge[] = [createTestEdge('e1', 'A', 'B'), createTestEdge('e2', 'A', 'C')]

    const metrics = calculateGraphMetrics(nodes, edges)

    expect(metrics.totalResources).toBe(3)
    expect(metrics.totalDependencies).toBe(2)
  })

  it('should identify leaf nodes (no dependencies)', () => {
    const nodes: CfnNode[] = [
      createTestNode('A', 'AWS::Lambda::Function'),
      createTestNode('B', 'AWS::S3::Bucket'),
      createTestNode('C', 'AWS::DynamoDB::Table'),
    ]

    const edges: CfnEdge[] = [
      createTestEdge('e1', 'B', 'A'), // A depends on B
      createTestEdge('e2', 'C', 'A'), // A depends on C
    ]

    const metrics = calculateGraphMetrics(nodes, edges)

    expect(metrics.leafNodes).toBe(2) // B and C are leaves
  })

  it('should identify root nodes (nothing depends on them)', () => {
    const nodes: CfnNode[] = [
      createTestNode('A', 'AWS::Lambda::Function'),
      createTestNode('B', 'AWS::S3::Bucket'),
      createTestNode('C', 'AWS::DynamoDB::Table'),
    ]

    const edges: CfnEdge[] = [
      createTestEdge('e1', 'B', 'A'), // A depends on B
      createTestEdge('e2', 'C', 'A'), // A depends on C
    ]

    const metrics = calculateGraphMetrics(nodes, edges)

    expect(metrics.rootNodes).toBe(1) // Only A is a root (nothing depends on it)
  })

  it('should calculate max dependency depth', () => {
    const nodes: CfnNode[] = [
      createTestNode('A', 'AWS::Lambda::Function'),
      createTestNode('B', 'AWS::S3::Bucket'),
      createTestNode('C', 'AWS::DynamoDB::Table'),
      createTestNode('D', 'AWS::SNS::Topic'),
    ]

    const edges: CfnEdge[] = [
      createTestEdge('e1', 'B', 'A'), // A depends on B
      createTestEdge('e2', 'C', 'B'), // B depends on C
      createTestEdge('e3', 'D', 'C'), // C depends on D
    ]

    const metrics = calculateGraphMetrics(nodes, edges)

    expect(metrics.maxDepth).toBe(3) // Chain: D <- C <- B <- A (depth 3)
  })

  it('should group resources by service', () => {
    const nodes: CfnNode[] = [
      createTestNode('Fn1', 'AWS::Lambda::Function'),
      createTestNode('Fn2', 'AWS::Lambda::Function'),
      createTestNode('Bucket', 'AWS::S3::Bucket'),
    ]

    const edges: CfnEdge[] = []

    const metrics = calculateGraphMetrics(nodes, edges)

    expect(metrics.resourcesByService.get('Lambda')).toBe(2)
    expect(metrics.resourcesByService.get('S3')).toBe(1)
  })

  it('should detect cycles in graph', () => {
    const nodes: CfnNode[] = [
      createTestNode('A', 'AWS::Lambda::Function'),
      createTestNode('B', 'AWS::S3::Bucket'),
      createTestNode('C', 'AWS::DynamoDB::Table'),
    ]

    const edges: CfnEdge[] = [
      createTestEdge('e1', 'B', 'A'), // A depends on B
      createTestEdge('e2', 'C', 'B'), // B depends on C
      createTestEdge('e3', 'A', 'C'), // C depends on A - Cycle!
    ]

    const metrics = calculateGraphMetrics(nodes, edges)

    expect(metrics.hasCycles).toBe(true)
  })

  it('should not detect cycles in acyclic graph', () => {
    const nodes: CfnNode[] = [
      createTestNode('A', 'AWS::Lambda::Function'),
      createTestNode('B', 'AWS::S3::Bucket'),
      createTestNode('C', 'AWS::DynamoDB::Table'),
    ]

    const edges: CfnEdge[] = [
      createTestEdge('e1', 'B', 'A'), // A depends on B
      createTestEdge('e2', 'C', 'A'), // A depends on C
    ]

    const metrics = calculateGraphMetrics(nodes, edges)

    expect(metrics.hasCycles).toBe(false)
  })

  it('should handle empty graph', () => {
    const metrics = calculateGraphMetrics([], [])

    expect(metrics.totalResources).toBe(0)
    expect(metrics.totalDependencies).toBe(0)
    expect(metrics.maxDepth).toBe(0)
    expect(metrics.leafNodes).toBe(0)
    expect(metrics.rootNodes).toBe(0)
    expect(metrics.hasCycles).toBe(false)
  })

  it('should handle single node with no edges', () => {
    const nodes: CfnNode[] = [createTestNode('A', 'AWS::Lambda::Function')]
    const edges: CfnEdge[] = []

    const metrics = calculateGraphMetrics(nodes, edges)

    expect(metrics.totalResources).toBe(1)
    expect(metrics.totalDependencies).toBe(0)
    expect(metrics.maxDepth).toBe(0)
    expect(metrics.leafNodes).toBe(1) // A is both leaf and root
    expect(metrics.rootNodes).toBe(1)
  })

  it('should handle disconnected subgraphs', () => {
    const nodes: CfnNode[] = [
      createTestNode('A', 'AWS::Lambda::Function'),
      createTestNode('B', 'AWS::S3::Bucket'),
      createTestNode('C', 'AWS::DynamoDB::Table'),
      createTestNode('D', 'AWS::SNS::Topic'),
    ]

    const edges: CfnEdge[] = [
      createTestEdge('e1', 'B', 'A'), // A depends on B
      createTestEdge('e2', 'D', 'C'), // C depends on D
    ]

    const metrics = calculateGraphMetrics(nodes, edges)

    expect(metrics.totalResources).toBe(4)
    expect(metrics.totalDependencies).toBe(2)
    expect(metrics.leafNodes).toBe(2) // B and D (no dependencies)
    expect(metrics.rootNodes).toBe(2) // A and C (no dependents)
  })
})
