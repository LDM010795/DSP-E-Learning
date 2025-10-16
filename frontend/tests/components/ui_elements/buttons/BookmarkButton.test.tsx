import { describe, it, beforeEach, vi, expect } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import BookmarkButton from "@components/ui_elements/buttons/BookmarkButton.tsx";

// Mock child components
vi.mock("@components/ui_elements/bookmarks/BookmarkPanel.tsx", () => ({
  default: (props: any) => (
    <div data-testid="bookmark-panel">
      <button onClick={props.onClearAll}>Clear All</button>
      <button onClick={props.onToggleSelecting}>Select</button>
      <button onClick={props.onToggleNotes}>Notes</button>
      <button onClick={() => props.onStartEdit?.("1", "Old Label")}>
        Edit
      </button>
      <button onClick={props.onRemove?.bind(null, "1")}>Remove</button>
      <button onClick={props.onSaveEdit}>Save</button>
      <button onClick={() => props.onJump?.(0, "#fake-el")}>Jump</button>
      <button onClick={props.onCancelEdit}>Cancel</button>
      <input
        role="textbox"
        value={props.editValue || ""}
        onChange={(e) => props.onChangeEditValue(e.target.value)}
      />
    </div>
  ),
}));

vi.mock("@components/ui_elements/bookmarks/NotesWindow.tsx", () => ({
  default: (props: any) =>
    props.open ? (
      <textarea
        role="textbox"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    ) : null,
}));

// Mock utils
vi.mock("frontend/src/components/ui_elements/bookmarks/utils.ts", () => ({
  closestBlock: vi.fn((el) => el),
  getCssPath: vi.fn((el) => `#${el.id}`),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock scrollIntoView
HTMLElement.prototype.scrollIntoView = vi.fn();

describe("BookmarkButton", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it("renders the toggle button", () => {
    render(<BookmarkButton />);
    const toggleButton = screen.getByRole("button", {
      name: /Lesezeichen öffnen\/schließen/i,
    });
    expect(toggleButton).toBeInTheDocument();
  });

  it("opens and closes the bookmark panel", () => {
    render(<BookmarkButton />);
    const toggleButton = screen.getByRole("button", {
      name: /Lesezeichen öffnen\/schließen/i,
    });

    // Panel should be open initially
    expect(screen.getByText(/Clear All/i)).toBeInTheDocument();

    // Close panel
    fireEvent.click(toggleButton);
    expect(screen.queryByText(/Clear All/i)).not.toBeInTheDocument();

    // Reopen panel
    fireEvent.click(toggleButton);
    expect(screen.getByText(/Clear All/i)).toBeInTheDocument();
  });

  it("adds a bookmark in selecting mode", async () => {
    render(<BookmarkButton />);
    fireEvent.click(screen.getByText(/Select/i));

    const clickTarget = document.createElement("div");
    clickTarget.id = "target";
    document.body.appendChild(clickTarget);

    await act(async () => {
      fireEvent.click(clickTarget, { clientY: 100 });
    });

    // The added bookmark should exist in localStorage
    const bookmarks = JSON.parse(
      window.localStorage.getItem("article-bookmarks:/")!,
    );
    expect(bookmarks.length).toBe(1);
  });

  it("loads bookmarks and notes from localStorage on mount", () => {
    const storedBookmarks = [{ id: "1", y: 10, path: "#p", createdAt: 123 }];
    const storedNotes = "stored note";
    window.localStorage.setItem(
      "article-bookmarks:/",
      JSON.stringify(storedBookmarks),
    );
    window.localStorage.setItem("article-bookmarks:/:notes", storedNotes);

    render(<BookmarkButton />);
    expect(screen.getByText(/Clear All/i)).toBeInTheDocument();

    const bookmarks = JSON.parse(
      window.localStorage.getItem("article-bookmarks:/")!,
    );
    const notes = window.localStorage.getItem("article-bookmarks:/:notes");
    expect(bookmarks).toEqual(storedBookmarks);
    expect(notes).toBe(storedNotes);
  });

  it("edits a bookmark", () => {
    // Add bookmark
    act(() => {
      window.localStorage.setItem(
        "article-bookmarks:/",
        JSON.stringify([
          {
            id: "1",
            y: 50,
            path: "#p1",
            createdAt: Date.now(),
            label: "Old Label",
          },
        ]),
      );
    });

    render(<BookmarkButton />);

    fireEvent.click(screen.getByText(/Edit/i));
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "New Label" } });
    fireEvent.click(screen.getByText(/Save/i));

    const bookmarks = JSON.parse(
      window.localStorage.getItem("article-bookmarks:/")!,
    );
    expect(bookmarks[0].label).toBe("New Label");
  });

  it("removes a bookmark", () => {
    act(() => {
      window.localStorage.setItem(
        "article-bookmarks:/",
        JSON.stringify([
          { id: "1", y: 50, path: "#p1", createdAt: Date.now() },
        ]),
      );
    });

    render(<BookmarkButton />);
    fireEvent.click(screen.getByText(/Remove/i));

    const bookmarks = JSON.parse(
      window.localStorage.getItem("article-bookmarks:/")!,
    );
    expect(bookmarks.length).toBe(0);
  });

  it("clears all bookmarks", () => {
    act(() => {
      window.localStorage.setItem(
        "article-bookmarks:/",
        JSON.stringify([
          { id: "1", y: 50, path: "#p1", createdAt: Date.now() },
        ]),
      );
    });

    render(<BookmarkButton />);
    fireEvent.click(screen.getByText(/Clear All/i));

    const bookmarks = JSON.parse(
      window.localStorage.getItem("article-bookmarks:/")!,
    );
    expect(bookmarks.length).toBe(0);
  });

  it("disables selecting mode after placing a bookmark", async () => {
    render(<BookmarkButton />);
    fireEvent.click(screen.getByText(/Select/i));

    const target = document.createElement("div");
    target.id = "t";
    document.body.appendChild(target);

    await act(async () => fireEvent.click(target, { clientY: 50 }));

    // Clicking again should not add a second bookmark
    await act(async () => fireEvent.click(target, { clientY: 60 }));
    const bookmarks = JSON.parse(
      window.localStorage.getItem("article-bookmarks:/")!,
    );
    expect(bookmarks.length).toBe(1);
  });

  it("applies and cleans up visual highlights", () => {
    const el = document.createElement("p");
    el.id = "p";
    document.body.appendChild(el);

    act(() => {
      window.localStorage.setItem(
        "article-bookmarks:/",
        JSON.stringify([{ id: "1", y: 0, path: "#p", createdAt: Date.now() }]),
      );
    });

    const { unmount } = render(<BookmarkButton />);
    expect(el.dataset.bmId).toBe("1");
    unmount();
    expect(el.dataset.bmId).toBeUndefined();
  });

  it("handles localStorage errors gracefully", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const setItemSpy = vi
      .spyOn(window.localStorage, "setItem")
      .mockImplementation(() => {
        throw new Error("fail");
      });

    render(<BookmarkButton />);
    expect(warnSpy).toHaveBeenCalled();

    setItemSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it("opens and closes notes window", () => {
    render(<BookmarkButton />);
    fireEvent.click(screen.getByText(/Notes/i));
    const textareas = screen.getAllByRole("textbox");
    const notesBox = textareas[textareas.length - 1]; // textarea from NotesWindow

    expect(notesBox).toBeInTheDocument();
    fireEvent.change(notesBox, { target: { value: "Hello" } });
    fireEvent.click(screen.getByText(/Notes/i)); // or trigger onClose
    // Simulate closing
    act(() => notesBox.dispatchEvent(new Event("blur")));
  });

  it("saves notes to localStorage after debounce", async () => {
    vi.useFakeTimers();
    render(<BookmarkButton />);

    fireEvent.click(screen.getByText(/Notes/i));

    const textareas = screen.getAllByRole("textbox");
    const notesBox = textareas[textareas.length - 1]; // textarea from NotesWindow

    fireEvent.change(notesBox, { target: { value: "new note" } });

    await act(async () => {
      vi.advanceTimersByTime(310);
    });
    await act(async () => {});

    expect(window.localStorage.getItem("article-bookmarks:/:notes")).toBe(
      "new note",
    );
    vi.useRealTimers();
  });

  it("cancels edit without saving", () => {
    act(() => {
      window.localStorage.setItem(
        "article-bookmarks:/",
        JSON.stringify([
          { id: "1", y: 10, path: "#p", createdAt: Date.now(), label: "Old" },
        ]),
      );
    });

    render(<BookmarkButton />);
    fireEvent.click(screen.getByText(/Edit/i));
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "New" } });

    fireEvent.click(screen.getByText(/Cancel/i)); // use new button

    const bookmarks = JSON.parse(
      window.localStorage.getItem("article-bookmarks:/")!,
    );
    expect(bookmarks[0].label).toBe("Old");
  });

  it("scrolls to bookmark when handleJump is called", () => {
    render(<BookmarkButton />);

    const fakeEl = document.createElement("div");
    fakeEl.id = "fake-el";
    document.body.appendChild(fakeEl);

    const scrollSpy = vi.spyOn(fakeEl, "scrollIntoView");

    fireEvent.click(screen.getByText(/Jump/i));

    expect(scrollSpy).toHaveBeenCalled();
  });
});
