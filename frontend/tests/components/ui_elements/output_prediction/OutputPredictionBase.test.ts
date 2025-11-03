/**
 *
 * Tests for the `matchesExpected` helper function, which compares
 * a user's answer against one or more expected outputs for the
 * OutputPrediction exercise.
 *
 * These tests verify:
 *  - Case sensitivity behavior (default vs. caseSensitive=true)
 *  - Handling of multiple valid expected answers
 *  - Custom normalization (e.g., trimming, whitespace collapsing)
 *  - Default normalization and comparison logic
 *
 * Author: DSP development team
 * Date: 03-11-2025
 */


import { describe, it, expect } from "vitest";
import { matchesExpected } from "@/components/ui_elements/output_prediction/OutputPredictionBase";

// Simple helper normalizer for testing
const trimAndCollapse = (s: string) => s.trim().replace(/\s+/g, " ");

describe("matchesExpected", () => {
  it("returns true for an exact match (default case-insensitive)", () => {
    expect(matchesExpected("Hello", ["hello", "world"])).toBe(true);
  });

  it("returns false when no expected value matches", () => {
    expect(matchesExpected("Nope", ["hello", "world"])).toBe(false);
  });

  it("respects caseSensitive=true (must match case exactly)", () => {
    expect(
      matchesExpected("Hello", ["hello"], { caseSensitive: true })
    ).toBe(false);
    expect(
      matchesExpected("Hello", ["Hello"], { caseSensitive: true })
    ).toBe(true);
  });

  it("applies provided normalizer to both user and expected answers", () => {
    const normalize = trimAndCollapse;

    expect(
      matchesExpected("  foo \n bar ", ["foo bar"], { normalize })
    ).toBe(true);
  });

  it("handles multiple expected answers and returns true if any match", () => {
    const expected = ["5", "5.0", "05"];
    expect(matchesExpected("5.0", expected)).toBe(true);
    expect(matchesExpected("6", expected)).toBe(false);
  });

  it("defaults to identity normalize function when none provided", () => {
    expect(matchesExpected("A", ["a"])).toBe(true); // case-insensitive default
    expect(matchesExpected("A", ["a"], { caseSensitive: true })).toBe(false);
  });

  it("trims or normalizes correctly when normalizer collapses whitespace", () => {
    expect(
      matchesExpected(" Hello   World ", ["Hello World"], { normalize: trimAndCollapse })
    ).toBe(true);
  });
});
