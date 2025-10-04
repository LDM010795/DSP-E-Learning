// BookmarkPanel.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BookmarkPanel from "@components/ui_elements/bookmarks/BookmarkPanel.tsx";
import { Bookmark } from "@components/ui_elements/bookmarks/types.ts";

const setup = (props?: Partial<React.ComponentProps<typeof BookmarkPanel>>) => {
  const defaultBookmarks: Bookmark[] = [
    {
      id: "1",
      y: 100,
      path: "path1",
      label: "Marke A",
      createdAt: 0,
    },
    {
      id: "2",
      y: 200,
      path: "path2",
      label: "",
      createdAt: 0,
    },
  ];

  const handlers = {
    onToggleSelecting: vi.fn(),
    onToggleNotes: vi.fn(),
    onClose: vi.fn(),
    onClearAll: vi.fn(),
    onChangeEditValue: vi.fn(),
    onStartEdit: vi.fn(),
    onSaveEdit: vi.fn(),
    onCancelEdit: vi.fn(),
    onRemove: vi.fn(),
    onJump: vi.fn(),
  };

  const utils = render(
    <BookmarkPanel
      bookmarks={defaultBookmarks}
      selecting={false}
      notesOpen={false}
      editingId={null}
      editValue=""
      {...handlers}
      {...props}
    />,
  );

  return { ...utils, handlers };
};

describe("BookmarkPanel", () => {
  it("renders all bookmarks with fallback labels", () => {
    setup();
    expect(screen.getByText("Marke A")).toBeInTheDocument();
    expect(screen.getByText("Lesezeichen 2")).toBeInTheDocument();
  });

  it("calls onToggleSelecting when clicking Setzen", () => {
    const { handlers } = setup();
    fireEvent.click(screen.getByRole("button", { name: /setzen/i }));
    expect(handlers.onToggleSelecting).toHaveBeenCalled();
  });

  it("calls onToggleNotes when clicking Notizen", () => {
    const { handlers } = setup();
    fireEvent.click(screen.getByRole("button", { name: /notizen/i }));
    expect(handlers.onToggleNotes).toHaveBeenCalled();
  });

  it("calls onClearAll when clicking Leeren", () => {
    const { handlers } = setup();
    fireEvent.click(
      screen.getByRole("button", { name: /alle lesezeichen löschen/i }),
    );
    expect(handlers.onClearAll).toHaveBeenCalled();
  });

  it("calls onClose when clicking Schließen", () => {
    const { handlers } = setup();
    fireEvent.click(screen.getByRole("button", { name: /schließen/i }));
    expect(handlers.onClose).toHaveBeenCalled();
  });

  it("calls onJump when clicking a bookmark", () => {
    const { handlers } = setup();
    fireEvent.click(
      screen.getByRole("button", { name: /zu lesezeichen 1 springen/i }),
    );
    expect(handlers.onJump).toHaveBeenCalledWith(100, "path1");
  });

  it("enters edit mode and allows saving", () => {
    const { handlers } = setup({ editingId: "1", editValue: "New Label" });

    const input = screen.getByRole("textbox", { name: /umbenennen/i });
    expect(input).toHaveValue("New Label");

    fireEvent.change(input, { target: { value: "Changed" } });
    expect(handlers.onChangeEditValue).toHaveBeenCalledWith("Changed");

    fireEvent.keyDown(input, { key: "Enter" });
    expect(handlers.onSaveEdit).toHaveBeenCalled();
  });

  it("cancels edit on Escape key", () => {
    const { handlers } = setup({ editingId: "1", editValue: "Test" });
    const input = screen.getByRole("textbox", { name: /umbenennen/i });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(handlers.onCancelEdit).toHaveBeenCalled();
  });

  it("removes a bookmark when clicking ×", () => {
    const { handlers } = setup();
    fireEvent.click(screen.getAllByRole("button", { name: /entfernen/i })[0]);
    expect(handlers.onRemove).toHaveBeenCalledWith("1");
  });

  it("starts edit when clicking rename button", () => {
    const { handlers } = setup();
    fireEvent.click(screen.getAllByRole("button", { name: /umbenennen/i })[0]);
    expect(handlers.onStartEdit).toHaveBeenCalledWith("1", "Marke A");
  });
});
