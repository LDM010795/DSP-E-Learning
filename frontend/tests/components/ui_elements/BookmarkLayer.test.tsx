// BookmarkLayer.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import BookmarkLayer, {
  Bookmark,
} from "@components/ui_elements/BookmarkLayer.tsx";

describe("BookmarkLayer", () => {
  const baseBookmark: Bookmark = {
    id: "1",
    y: 100,
    label: "Test",
    createdAt: Date.now(),
  };

  it("renders no bookmarks if list is empty", () => {
    render(<BookmarkLayer bookmarks={[]} />);
    // No "Lesezeichen" labels should exist
    expect(screen.queryByText("Lesezeichen")).not.toBeInTheDocument();
  });

  it("renders a bookmark line and label", () => {
    render(<BookmarkLayer bookmarks={[baseBookmark]} />);
    expect(screen.getByText("Lesezeichen")).toBeInTheDocument();

    const container = document.querySelector(
      ".pointer-events-none",
    ) as HTMLElement;
    expect(container).not.toBeNull();

    expect(container.style.top).toBe("100px");
  });
});
