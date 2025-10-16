// ButtonFilterSimple.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import ButtonFilterSimple from "@components/ui_elements/buttons/button_filter_simple.tsx";
import { vi } from "vitest";

describe("ButtonFilterSimple", () => {
  const baseProps = {
    label: "Category",
    options: ["A", "B", "C"],
    onOptionClick: vi.fn(),
    onClearClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders label and buttons", () => {
    render(
      <ButtonFilterSimple
        {...baseProps}
        activeOptions={[]}
        multiSelectEnabled={false}
      />
    );
    expect(screen.getByText("Category")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /A|B|C/ })).toHaveLength(3);
  });

  it("calls onOptionClick with new active option (single select)", () => {
    render(
      <ButtonFilterSimple
        {...baseProps}
        activeOptions={[]}
        multiSelectEnabled={false}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "A" }));
    expect(baseProps.onOptionClick).toHaveBeenCalledWith(["A"]);
  });

  it("deselects when same option clicked again (single select)", () => {
    render(
      <ButtonFilterSimple
        {...baseProps}
        activeOptions={["A"]}
        multiSelectEnabled={false}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "A" }));
    expect(baseProps.onOptionClick).toHaveBeenCalledWith([]);
  });

  it("supports multiple selections when multiSelectEnabled=true", () => {
    render(
      <ButtonFilterSimple
        {...baseProps}
        activeOptions={["A"]}
        multiSelectEnabled={true}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "B" }));
    expect(baseProps.onOptionClick).toHaveBeenCalledWith(["A", "B"]);

    fireEvent.click(screen.getByRole("button", { name: "A" }));
    expect(baseProps.onOptionClick).toHaveBeenCalledWith([]);
  });

  it("shows clear button only when activeOptions not empty", () => {
    const { rerender } = render(
      <ButtonFilterSimple
        {...baseProps}
        activeOptions={[]}
        multiSelectEnabled={false}
      />
    );
    expect(screen.queryByText("Löschen")).not.toBeInTheDocument();

    rerender(
      <ButtonFilterSimple
        {...baseProps}
        activeOptions={["A"]}
        multiSelectEnabled={false}
      />
    );
    expect(screen.getByText("Löschen")).toBeInTheDocument();
  });

  it("calls onClearClick when clear button pressed", () => {
    render(
      <ButtonFilterSimple
        {...baseProps}
        activeOptions={["A"]}
        multiSelectEnabled={false}
      />
    );
    fireEvent.click(screen.getByText("Löschen"));
    expect(baseProps.onClearClick).toHaveBeenCalledTimes(1);
  });
});