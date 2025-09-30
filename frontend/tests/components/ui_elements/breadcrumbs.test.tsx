import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Breadcrumbs from "@components/ui_elements/breadcrumbs.tsx";

describe("Breadcrumbs component", () => {
  const items = [
    { label: "Home", path: "/" },
    { label: "Products", path: "/products" },
    { label: "Shoes" }, // last item, no path
  ];

  it("renders breadcrumb items correctly", () => {
    render(
      <MemoryRouter>
        <Breadcrumbs items={items} />
      </MemoryRouter>,
    );

    // All labels are rendered
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Shoes")).toBeInTheDocument();
  });

  it("renders links for items with path except last item", () => {
    render(
      <MemoryRouter>
        <Breadcrumbs items={items} />
      </MemoryRouter>,
    );

    const homeLink = screen.getByText("Home");
    const productsLink = screen.getByText("Products");
    const shoesSpan = screen.getByText("Shoes");

    // Links should be <a> elements
    expect(homeLink.closest("a")).toHaveAttribute("href", "/");
    expect(productsLink.closest("a")).toHaveAttribute("href", "/products");

    // Last item should not be a link
    expect(shoesSpan.closest("a")).toBeNull();
  });

  it("marks the last item as current page", () => {
    render(
      <MemoryRouter>
        <Breadcrumbs items={items} />
      </MemoryRouter>,
    );

    const lastItem = screen.getByText("Shoes");
    expect(lastItem).toHaveAttribute("aria-current", "page");
  });

  it("renders separators correctly", () => {
    render(
      <MemoryRouter>
        <Breadcrumbs items={items} />
      </MemoryRouter>,
    );

    // Should have 2 separators (n-1)
    const separators = screen.getAllByTestId("breadcrumb-separator");
    expect(separators).toHaveLength(items.length - 1);
  });

  it("renders nothing if items is empty or undefined", () => {
    const { container: emptyContainer } = render(
      <MemoryRouter>
        <Breadcrumbs items={[]} />
      </MemoryRouter>,
    );
    expect(emptyContainer.firstChild).toBeNull();

    const { container: undefinedContainer } = render(
      <MemoryRouter>
        <Breadcrumbs items={undefined as any} />
      </MemoryRouter>,
    );
    expect(undefinedContainer.firstChild).toBeNull();
  });

  it("applies additional className to container", () => {
    render(
      <MemoryRouter>
        <Breadcrumbs items={items} className="custom-class" />
      </MemoryRouter>,
    );

    const nav = screen.getByLabelText("breadcrumb");
    expect(nav).toHaveClass("custom-class");
  });
});
