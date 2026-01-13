/**
 * Tests for ACE Editor Configuration
 */

import { describe, it, expect, vi } from 'vitest'
import {
  DEFAULT_EDITOR_CONFIG,
  DEFAULT_PERFORMANCE_CONFIG,
  checkPerformanceLimits,
  debounce,
  getOptimizedConfig,
} from './editor-config'

describe('editor-config', () => {
  describe('DEFAULT_EDITOR_CONFIG', () => {
    it('should have sensible defaults', () => {
      expect(DEFAULT_EDITOR_CONFIG.showLineNumbers).toBe(true)
      expect(DEFAULT_EDITOR_CONFIG.enableFolding).toBe(true)
      expect(DEFAULT_EDITOR_CONFIG.enableLiveAutocompletion).toBe(true)
      expect(DEFAULT_EDITOR_CONFIG.tabSize).toBe(2)
      expect(DEFAULT_EDITOR_CONFIG.useSoftTabs).toBe(true)
      expect(DEFAULT_EDITOR_CONFIG.wrap).toBe(true)
    })

    it('should have performance-optimized debounce delay', () => {
      expect(DEFAULT_EDITOR_CONFIG.debounceDelay).toBe(300)
    })
  })

  describe('DEFAULT_PERFORMANCE_CONFIG', () => {
    it('should have reasonable size limits', () => {
      expect(DEFAULT_PERFORMANCE_CONFIG.maxHighlightSize).toBe(1024 * 1024) // 1MB
      expect(DEFAULT_PERFORMANCE_CONFIG.maxAutoCompleteSize).toBe(512 * 1024) // 512KB
    })

    it('should have validation delay under 200ms', () => {
      expect(DEFAULT_PERFORMANCE_CONFIG.validationDelay).toBeLessThanOrEqual(200)
    })

    it('should have auto-complete delay under 100ms', () => {
      expect(DEFAULT_PERFORMANCE_CONFIG.autoCompleteDelay).toBeLessThanOrEqual(100)
    })
  })

  describe('checkPerformanceLimits', () => {
    it('should enable all features for small files', () => {
      const result = checkPerformanceLimits(1024) // 1KB
      expect(result.enableHighlighting).toBe(true)
      expect(result.enableAutoComplete).toBe(true)
    })

    it('should disable auto-complete for medium files', () => {
      const result = checkPerformanceLimits(768 * 1024) // 768KB
      expect(result.enableHighlighting).toBe(true)
      expect(result.enableAutoComplete).toBe(false)
    })

    it('should disable all features for large files', () => {
      const result = checkPerformanceLimits(2 * 1024 * 1024) // 2MB
      expect(result.enableHighlighting).toBe(false)
      expect(result.enableAutoComplete).toBe(false)
    })

    it('should respect custom performance config', () => {
      const customConfig = {
        maxHighlightSize: 100,
        maxAutoCompleteSize: 50,
        validationDelay: 200,
        autoCompleteDelay: 100,
      }

      const result = checkPerformanceLimits(75, customConfig)
      expect(result.enableHighlighting).toBe(true)
      expect(result.enableAutoComplete).toBe(false)
    })
  })

  describe('debounce', () => {
    it('should delay function execution', async () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)

      debounced()
      expect(fn).not.toHaveBeenCalled()

      await new Promise((resolve) => setTimeout(resolve, 150))
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should cancel previous calls', async () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)

      debounced()
      debounced()
      debounced()

      await new Promise((resolve) => setTimeout(resolve, 150))
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should pass arguments correctly', async () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 50)

      debounced('arg1', 'arg2')

      await new Promise((resolve) => setTimeout(resolve, 100))
      expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
    })
  })

  describe('getOptimizedConfig', () => {
    it('should return empty config for small files', () => {
      const config = getOptimizedConfig(1024) // 1KB
      expect(config).toEqual({})
    })

    it('should disable auto-complete for medium files', () => {
      const config = getOptimizedConfig(768 * 1024) // 768KB
      expect(config.enableLiveAutocompletion).toBe(false)
      expect(config.enableBasicAutocompletion).toBe(false)
      expect(config.useWorker).toBeUndefined()
    })

    it('should disable all expensive features for large files', () => {
      const config = getOptimizedConfig(2 * 1024 * 1024) // 2MB
      expect(config.useWorker).toBe(false)
      expect(config.enableLiveAutocompletion).toBe(false)
      expect(config.enableBasicAutocompletion).toBe(false)
      expect(config.highlightSelectedWord).toBe(false)
    })
  })
})
