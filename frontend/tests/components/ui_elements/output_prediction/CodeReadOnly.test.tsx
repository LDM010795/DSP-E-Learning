/**
 *
 * Tests for the <CodeReadOnly /> component.
 *
 * The tests verify:
 *  - Proper rendering of filename and language labels
 *  - Line numbering and structure of rendered code
 *  - Interaction with helper functions and external libraries
 *    • Ensures mapLanguage() is called with the provided language
 *    • Verifies Prism.highlight() is called for each code line
 *  - Rendering of highlighted code content (via dangerouslySetInnerHTML)
 *  - Handling of optional props such as custom className
 *
 * Mocks:
 *  - mapLanguage() is mocked to control language mapping output.
 *  - Prism.js is mocked to verify syntax highlighting calls.
 *
 * Author: DSP development team
 * Date: 03-11-2025
 */


import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// --- Mock mapLanguage BEFORE importing the component ---
vi.mock("@/components/ui_elements/output_prediction/helpers/mapLanguage", () => {
  return {
    mapLanguage: vi.fn(() => "javascript"),
  };
});

// --- Mock Prism ---
vi.mock("prismjs", () => ({
  default: {
    highlight: vi.fn((src: string) => `highlighted:${src}`),
    languages: { javascript: {}, python: {} }, // keep both to be safe
  },
}));

// Now import the SUT and the mocked deps
import CodeReadOnly from "@/components/ui_elements/output_prediction/CodeReadOnly";
import Prism from "prismjs";
import { mapLanguage } from "@/components/ui_elements/output_prediction/helpers/mapLanguage";

describe("CodeReadOnly", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders filename and language header", () => {
    render(<CodeReadOnly code="print('hi')" language="python" filename="demo.py" />);
    expect(screen.getByText("demo.py")).toBeInTheDocument();
    expect(screen.getByText("python")).toBeInTheDocument();
  });

  it("splits code into multiple lines with numbers", () => {
    render(
      <CodeReadOnly
        code={`a = 1\nb = 2\nprint(a + b)`}
        language="python"
        filename="snippet.py"
      />
    );
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByTestId("output-prediction-code")).toBeInTheDocument();
  });

  it("calls mapLanguage with the provided language", () => {
    render(<CodeReadOnly code="print('test')" language="python" />);
    expect(mapLanguage).toHaveBeenCalledWith("python");
  });

  it("uses Prism.highlight for each code line", () => {
    render(<CodeReadOnly code={"x = 1\ny = 2"} language="python" />);
    // 2 lines → 2 calls
    expect((Prism as any).highlight).toHaveBeenCalledTimes(2);
    // Because mapLanguage is mocked to 'javascript'
    expect((Prism as any).highlight).toHaveBeenNthCalledWith(1, "x = 1", {}, "javascript");
    expect((Prism as any).highlight).toHaveBeenNthCalledWith(2, "y = 2", {}, "javascript");
  });

  it("renders highlighted code correctly", () => {
    const { container } = render(<CodeReadOnly code="print('Hello')" language="python" />);
    expect(container.innerHTML).toContain("highlighted:print('Hello')");
  });

  it("renders custom className when provided", () => {
    const { container } = render(
      <CodeReadOnly code="print(1)" language="python" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
