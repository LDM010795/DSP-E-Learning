import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ButtonFilterCategory from "@components/ui_elements/buttons/button_filter_category.tsx";
import userEvent from "@testing-library/user-event";

describe("ButtonFilterCategory", () => {
  const categories = ["Tech", "Design", "Finance"];

  it("renders closed with correct button label", () => {
    render(
      <ButtonFilterCategory
        allCategories={categories}
        activeCategories={[]}
        onCategoryChange={vi.fn()}
        onClearClick={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: /Kategorie/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens dropdown on click", () => {
    render(
      <ButtonFilterCategory
        allCategories={categories}
        activeCategories={[]}
        onCategoryChange={vi.fn()}
        onClearClick={vi.fn()}
      />,
    );

    const trigger = screen.getByRole("button", { name: /Kategorie/i });
    fireEvent.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByText("Nach Kategorie filtern")).toBeInTheDocument();
  });

  it("calls onCategoryChange when a checkbox is toggled", () => {
    const onCategoryChange = vi.fn();
    render(
      <ButtonFilterCategory
        allCategories={categories}
        activeCategories={[]}
        onCategoryChange={onCategoryChange}
        onClearClick={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button"));
    const checkbox = screen.getByLabelText("Tech");
    fireEvent.click(checkbox);
    expect(onCategoryChange).toHaveBeenCalledWith("Tech", true);
  });

  it("shows 'Filter löschen' when activeCategories non-empty (render initial)", async () => {
    const user = userEvent.setup();
    render(
      <ButtonFilterCategory
        allCategories={["Tech", "Design", "Finance"]}
        activeCategories={["Tech"]}
        onCategoryChange={vi.fn()}
        onClearClick={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Kategorie/i }));
    expect(screen.getByText(/Filter löschen/i)).toBeInTheDocument();
  });

  it("calls onClearClick when 'Filter löschen' is clicked", () => {
    const onClearClick = vi.fn();
    render(
      <ButtonFilterCategory
        allCategories={categories}
        activeCategories={["Tech"]}
        onCategoryChange={vi.fn()}
        onClearClick={onClearClick}
      />,
    );

    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText(/Filter löschen/));
    expect(onClearClick).toHaveBeenCalled();
  });

  it("closes when clicking outside", () => {
    render(
      <>
        <div data-testid="outside">Outside</div>
        <ButtonFilterCategory
          allCategories={categories}
          activeCategories={[]}
          onCategoryChange={vi.fn()}
          onClearClick={vi.fn()}
        />
      </>,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
