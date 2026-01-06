/**
 * useTemplateParser Hook
 *
 * Encapsulates CloudFormation template parsing logic.
 * Provides a stable parse function for template validation.
 */

import { useCallback } from "react";

import { parseTemplate } from "@/lib/parser";

import type { ParseResult } from "@/lib/parser";

/**
 * Return type for the useTemplateParser hook
 */
export interface UseTemplateParserReturn {
  /** Parse a CloudFormation template string */
  parse: (input: string) => ParseResult;
}

/**
 * Hook to parse CloudFormation templates.
 *
 * Provides a memoized parse function that validates JSON templates
 * and returns a discriminated union result type.
 *
 * @returns Object containing the parse function
 *
 * @example
 * ```tsx
 * function TemplateEditor() {
 *   const { parse } = useTemplateParser();
 *
 *   const handleValidate = (template: string) => {
 *     const result = parse(template);
 *     if (result.success) {
 *       console.log('Valid template:', result.template);
 *     } else {
 *       console.error('Parse error:', result.error);
 *     }
 *   };
 * }
 * ```
 */
export function useTemplateParser(): UseTemplateParserReturn {
  const parse = useCallback((input: string): ParseResult => {
    return parseTemplate(input);
  }, []);

  return { parse };
}
