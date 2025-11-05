/**
 *
 * Reusable normalization utilities for output comparison.
 * Compose them to match the grading policy.
 *
 * Author: DSP development team
 * Date: 30-10-2025
 */

/** Trim start/end. */
export const trimEdges = (s: string) => s.trim();

/** Normalize all CRLF (\r\n) to LF (\n). */
export const normalizeNewlines = (s: string) => s.replace(/\r\n/g, "\n");

/** Collapse all runs of whitespace (including newlines) to a single space. */
export const collapseWhitespace = (s: string) => s.replace(/\s+/g, " ").trim();

/** Remove trailing newline(s) only (keep internal newlines). */
export const stripTrailingNewlines = (s: string) => s.replace(/\n+$/, "");

/** Compose normalizers left-to-right. */
export const compose =
  (...fns: Array<(s: string) => string>) =>
  (s: string) =>
    fns.reduce((acc, fn) => fn(acc), s);

/**
 * A sensible default for code-output:
 * - normalize newlines (CRLF->LF)
 * - trim outer edges
 * - strip trailing final newline (common in many REPLs)
 */
export const defaultOutputNormalizer = compose(
  normalizeNewlines,
  trimEdges,
  stripTrailingNewlines,
);
