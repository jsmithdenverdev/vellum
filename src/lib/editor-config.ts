/**
 * ACE Editor Configuration for CloudFormation Templates
 *
 * Provides optimized editor settings for CloudFormation JSON/YAML editing
 * with performance tuning and CloudFormation-specific features.
 */

import type { Ace } from 'ace-builds'

// =============================================================================
// Configuration Types
// =============================================================================

/**
 * Editor configuration options
 */
export interface EditorConfig {
  /** Enable line numbers */
  showLineNumbers: boolean
  /** Enable code folding */
  enableFolding: boolean
  /** Enable auto-completion */
  enableLiveAutocompletion: boolean
  /** Enable basic auto-completion */
  enableBasicAutocompletion: boolean
  /** Enable snippets */
  enableSnippets: boolean
  /** Tab size in spaces */
  tabSize: number
  /** Use soft tabs (spaces) */
  useSoftTabs: boolean
  /** Wrap lines */
  wrap: boolean
  /** Show print margin */
  showPrintMargin: boolean
  /** Print margin column */
  printMarginColumn: number
  /** Highlight active line */
  highlightActiveLine: boolean
  /** Highlight selected word */
  highlightSelectedWord: boolean
  /** Show gutter */
  showGutter: boolean
  /** Font size */
  fontSize: number
  /** Enable syntax validation */
  useWorker: boolean
  /** Debounce delay for change events (ms) */
  debounceDelay: number
}

/**
 * Performance optimization settings
 */
export interface PerformanceConfig {
  /** Maximum file size for syntax highlighting (bytes) */
  maxHighlightSize: number
  /** Maximum file size for auto-completion (bytes) */
  maxAutoCompleteSize: number
  /** Debounce delay for validation (ms) */
  validationDelay: number
  /** Debounce delay for auto-completion (ms) */
  autoCompleteDelay: number
}

// =============================================================================
// Default Configurations
// =============================================================================

/**
 * Default editor configuration optimized for CloudFormation templates
 */
export const DEFAULT_EDITOR_CONFIG: EditorConfig = {
  showLineNumbers: true,
  enableFolding: true,
  enableLiveAutocompletion: true,
  enableBasicAutocompletion: true,
  enableSnippets: true,
  tabSize: 2,
  useSoftTabs: true,
  wrap: true,
  showPrintMargin: false,
  printMarginColumn: 120,
  highlightActiveLine: true,
  highlightSelectedWord: true,
  showGutter: true,
  fontSize: 14,
  useWorker: true,
  debounceDelay: 300,
}

/**
 * Performance configuration with sensible defaults
 */
export const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  maxHighlightSize: 1024 * 1024, // 1MB
  maxAutoCompleteSize: 512 * 1024, // 512KB
  validationDelay: 200,
  autoCompleteDelay: 100,
}

// =============================================================================
// Configuration Functions
// =============================================================================

/**
 * Applies editor configuration to an ACE editor instance
 *
 * @param editor - ACE editor instance
 * @param config - Editor configuration (uses defaults if not provided)
 * @returns The configured editor instance
 *
 * @example
 * ```typescript
 * const editor = ace.edit("editor");
 * configureEditor(editor);
 * ```
 */
export function configureEditor(
  editor: Ace.Editor,
  config: Partial<EditorConfig> = {}
): Ace.Editor {
  const finalConfig = { ...DEFAULT_EDITOR_CONFIG, ...config }

  // Basic editor options
  editor.setOptions({
    showLineNumbers: finalConfig.showLineNumbers,
    showGutter: finalConfig.showGutter,
    highlightActiveLine: finalConfig.highlightActiveLine,
    highlightSelectedWord: finalConfig.highlightSelectedWord,
    showPrintMargin: finalConfig.showPrintMargin,
    printMarginColumn: finalConfig.printMarginColumn,
    fontSize: finalConfig.fontSize,
    enableBasicAutocompletion: finalConfig.enableBasicAutocompletion,
    enableLiveAutocompletion: finalConfig.enableLiveAutocompletion,
    enableSnippets: finalConfig.enableSnippets,
    useWorker: finalConfig.useWorker,
  })

  // Session options
  const session = editor.getSession()
  session.setTabSize(finalConfig.tabSize)
  session.setUseSoftTabs(finalConfig.useSoftTabs)
  session.setUseWrapMode(finalConfig.wrap)

  // Enable folding
  if (finalConfig.enableFolding) {
    session.setFoldStyle('markbegin')
  }

  return editor
}

/**
 * Checks if a file size is within performance limits
 *
 * @param size - File size in bytes
 * @param config - Performance configuration
 * @returns Object indicating which features should be enabled
 */
export function checkPerformanceLimits(
  size: number,
  config: PerformanceConfig = DEFAULT_PERFORMANCE_CONFIG
): {
  enableHighlighting: boolean
  enableAutoComplete: boolean
} {
  return {
    enableHighlighting: size <= config.maxHighlightSize,
    enableAutoComplete: size <= config.maxAutoCompleteSize,
  }
}

/**
 * Creates a debounced function for editor events
 *
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, delay)
  }
}

/**
 * Gets recommended configuration based on file size
 *
 * @param fileSize - Size of the file in bytes
 * @returns Optimized editor configuration
 */
export function getOptimizedConfig(fileSize: number): Partial<EditorConfig> {
  const limits = checkPerformanceLimits(fileSize)

  // For large files, disable expensive features
  if (!limits.enableHighlighting) {
    return {
      useWorker: false,
      enableLiveAutocompletion: false,
      enableBasicAutocompletion: false,
      highlightSelectedWord: false,
    }
  }

  if (!limits.enableAutoComplete) {
    return {
      enableLiveAutocompletion: false,
      enableBasicAutocompletion: false,
    }
  }

  return {}
}
