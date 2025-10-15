/**
 * FilterHead Component Tests
 *
 * FilterHead Component Tests verifies:
 *  - Title and children render
 *  - Search input visibility depends on props (showSearch + onSearchChange)
 *  - Input updates local UI instantly and calls onSearchChange (debounced hook mocked to pass-through)
 *  - External searchTerm prop syncs into the input without re-firing onSearchChange unnecessarily
 *
 *  Author: DSP Development Team
 *  Date: 24-09-2025
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterHead from "../../../src/components/filter/filter_head";

// Mock useDebounce to return the value immediately (no delay)
// This keeps tests deterministic; we still verify “when” it fires based on prop equality.
vi.mock("../../../src/util/performance", () => ({
  useDebounce: <T,>(v: T) => v,
}));

describe("FilterHead", () => {
  test("renders title and children", () => {
    render(
      <FilterHead title="Meine Filter" showSearch={false}>
        <button>Kind-Action</button>
      </FilterHead>,
    );

    expect(screen.getByText("Meine Filter")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Kind-Action" }),
    ).toBeInTheDocument();
  });

  test("shows search input only when showSearch is true and onSearchChange provided", () => {
    const { rerender } = render(<FilterHead title="T" showSearch={false} />);
    expect(screen.queryByPlaceholderText("Suchen...")).not.toBeInTheDocument();

    rerender(<FilterHead title="T" showSearch={true} />);
    // No onSearchChange → search input still hidden
    expect(screen.queryByPlaceholderText("Suchen...")).not.toBeInTheDocument();

    const onSearch = vi.fn();
    rerender(
      <FilterHead title="T" showSearch={true} onSearchChange={onSearch} />,
    );
    expect(screen.getByPlaceholderText("Suchen...")).toBeInTheDocument();
  });

  test("typing updates input and calls onSearchChange (debounce mocked immediate)", async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();

    render(
      <FilterHead
        showSearch
        onSearchChange={onSearch}
        searchPlaceholder="Suche hier"
      />,
    );

    const input = screen.getByPlaceholderText("Suche hier") as HTMLInputElement;
    expect(input.value).toBe("");

    await user.type(input, "hello");
    expect(input.value).toBe("hello");
    // Because useDebounce is mocked to immediate, callback fires with the latest value
    expect(onSearch).toHaveBeenLastCalledWith("hello");
    expect(onSearch).toHaveBeenCalledTimes(6); // one call per typed char with our pass-through mock
    expect(onSearch.mock.calls[0][0]).toBe("");
  });

  test("syncs external searchTerm prop to input and avoids redundant onSearchChange", async () => {
    const onSearch = vi.fn();
    const { rerender } = render(
      <FilterHead showSearch onSearchChange={onSearch} searchTerm="start" />,
    );

    // Input reflects external value
    expect(screen.getByDisplayValue("start")).toBeInTheDocument();

    // Clear any mount-time call
    onSearch.mockClear();

    // Change external prop to a new value
    rerender(
      <FilterHead showSearch onSearchChange={onSearch} searchTerm="extern" />,
    );
    expect(screen.getByDisplayValue("extern")).toBeInTheDocument();

    // Let effects settle
    await Promise.resolve();
    await Promise.resolve();

    // We must NOT call with the new prop value during this sync step.
    // (A transient call with the previous value can occur due to effect ordering.)
    const calls = onSearch.mock.calls.map((c) => c[0]);
    expect(calls).not.toContain("extern");
  });

  test("placeholder can be customized", () => {
    render(
      <FilterHead
        showSearch
        onSearchChange={() => {}}
        searchPlaceholder="Module suchen"
      />,
    );
    expect(screen.getByPlaceholderText("Module suchen")).toBeInTheDocument();
  });
});
