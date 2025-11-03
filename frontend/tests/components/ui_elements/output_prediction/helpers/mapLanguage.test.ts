/**
 *
 * Tests for the `mapLanguage` helper function used in the
 * Output Prediction component suite.
 *
 * Purpose:
 *   Ensures that various user-facing or framework-specific
 *   language labels are consistently mapped to Prism-compatible
 *   syntax highlighting identifiers.
 *
 * The tests verify:
 *  - Correct mappings for TypeScript, TSX, JSX, JavaScript, Python, and CSS.
 *  - Fallback behavior for unknown languages (returns input unchanged).
 *  - Default behavior when no language is provided (defaults to 'javascript').
 *
 * Author: DSP development team
 * Date: 03-11-2025
 */


import { describe, it, expect } from "vitest";
import { mapLanguage } from "@/components/ui_elements/output_prediction/helpers/mapLanguage";

describe("mapLanguage", () => {
  it("returns 'tsx' for TypeScript React labels", () => {
    expect(mapLanguage("TypeScript React")).toBe("tsx");
    expect(mapLanguage("typescriptreact")).toBe("tsx");
  });

  it("returns 'tsx' for TSX label", () => {
    expect(mapLanguage("tsx")).toBe("tsx");
  });

  it("returns 'jsx' for JSX label", () => {
    expect(mapLanguage("jsx")).toBe("jsx");
  });

  it("returns 'typescript' for TypeScript or ts labels", () => {
    expect(mapLanguage("TypeScript")).toBe("typescript");
    expect(mapLanguage("ts")).toBe("typescript");
  });

  it("returns 'javascript' for js labels", () => {
    expect(mapLanguage("js")).toBe("javascript");
    expect(mapLanguage("JavaScript")).toBe("javascript");
  });

  it("returns 'python' for py labels", () => {
    expect(mapLanguage("py")).toBe("python");
    expect(mapLanguage("Python")).toBe("python");
  });

  it("returns 'css' for css labels", () => {
    expect(mapLanguage("css")).toBe("css");
  });

  it("returns original label when it does not match any known language", () => {
    expect(mapLanguage("ruby")).toBe("ruby");
  });

  it("returns 'javascript' as default when label is undefined", () => {
    expect(mapLanguage()).toBe("javascript");
  });
});
