/**
 *
 * Tests for string normalization utility functions used in
 * Output Prediction exercises.
 *
 * The tests cover:
 *  - trimEdges: ensures leading/trailing whitespace and newlines are removed.
 *  - normalizeNewlines: converts Windows-style line endings (\r\n) to LF (\n).
 *  - collapseWhitespace: collapses multiple whitespace and newline characters into a single space.
 *  - stripTrailingNewlines: removes only trailing newline characters while preserving internal ones.
 *  - compose: verifies function composition order (left-to-right).
 *  - defaultOutputNormalizer: ensures composed normalization produces clean, comparable output.
 *
 * These utilities ensure consistent comparison of student outputs
 * regardless of formatting or platform-specific differences.
 *
 * Author: DSP development team
 * Date: 03-11-2025
 */

import { describe, it, expect } from "vitest";
import {
  trimEdges,
  normalizeNewlines,
  collapseWhitespace,
  stripTrailingNewlines,
  compose,
  defaultOutputNormalizer,
} from "@/components/ui_elements/output_prediction/helpers/normalizers";

describe("normalizers utilities", () => {
  it("trimEdges removes spaces at start and end", () => {
    expect(trimEdges("  hello  ")).toBe("hello");
    expect(trimEdges("\n test\t")).toBe("test");
  });

  it("normalizeNewlines replaces CRLF with LF", () => {
    const input = "a\r\nb\r\nc";
    expect(normalizeNewlines(input)).toBe("a\nb\nc");
  });

  it("collapseWhitespace reduces all whitespace and newlines to single spaces", () => {
    const input = "a   b \n  c\t d";
    expect(collapseWhitespace(input)).toBe("a b c d");
  });

  it("stripTrailingNewlines removes only final newlines", () => {
    expect(stripTrailingNewlines("a\nb\n")).toBe("a\nb");
    expect(stripTrailingNewlines("a\nb\n\n\n")).toBe("a\nb");
    expect(stripTrailingNewlines("a\nb")).toBe("a\nb");
  });

  it("compose applies functions in sequence left-to-right", () => {
    const composed = compose(
      (s) => s.trim(),
      (s) => s.toUpperCase(),
      (s) => s + "!",
    );
    expect(composed("  hi  ")).toBe("HI!");
  });

  it("defaultOutputNormalizer combines normalizeNewlines, trimEdges, and stripTrailingNewlines", () => {
    const messy = "\r\n  a\r\nb\r\n\n";
    const expected = "a\nb";
    expect(defaultOutputNormalizer(messy)).toBe(expected);
  });
});
