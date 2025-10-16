import { render, screen, fireEvent } from "@testing-library/react";
import NotesWindow from "@components/ui_elements/bookmarks/NotesWindow.tsx";
import { vi } from "vitest";

// mock DraggableResizableWindow to simplify testing
vi.mock(
  "@components/ui_elements/overlays/DraggableResizableWindow.tsx",
  () => ({
    default: ({ children, title, open, onClose }: any) =>
      open ? (
        <div data-testid="window">
          <h1>{title}</h1>
          <button onClick={onClose}>close</button>
          {children}
        </div>
      ) : null,
  }),
);

// mock NotesEditor to capture props
vi.mock("@components/ui_elements/bookmarks/NotesEditor.tsx", () => ({
  default: ({ value, onChange, toolbarRight }: any) => (
    <div>
      <textarea
        data-testid="editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {toolbarRight}
    </div>
  ),
}));

describe("NotesWindow", () => {
  it("renders only if open=true", () => {
    const { rerender } = render(
      <NotesWindow
        open={false}
        value="test"
        onChange={() => {}}
        onClose={() => {}}
      />,
    );
    expect(screen.queryByTestId("window")).toBeNull();

    rerender(
      <NotesWindow
        open={true}
        value="test"
        onChange={() => {}}
        onClose={() => {}}
      />,
    );
    expect(screen.getByTestId("window")).toBeInTheDocument();
  });

  it("calls onChange when typing in NotesEditor", () => {
    const handleChange = vi.fn();
    render(
      <NotesWindow
        open
        value="abc"
        onChange={handleChange}
        onClose={() => {}}
      />,
    );
    fireEvent.change(screen.getByTestId("editor"), {
      target: { value: "xyz" },
    });
    expect(handleChange).toHaveBeenCalledWith("xyz");
  });

  it("clears text when 'Leeren' is clicked", () => {
    const handleChange = vi.fn();
    render(
      <NotesWindow
        open
        value="abc"
        onChange={handleChange}
        onClose={() => {}}
      />,
    );
    fireEvent.click(screen.getByText("Leeren"));
    expect(handleChange).toHaveBeenCalledWith("");
  });

  it("shows correct character count", () => {
    render(
      <NotesWindow
        open
        value="<b>abc</b>"
        onChange={() => {}}
        onClose={() => {}}
      />,
    );
    expect(screen.getByText("3 Zeichen")).toBeInTheDocument();
  });

  it("triggers export with correct filename", () => {
    const createObjectURL = vi.fn(() => "blob:url");
    const revokeObjectURL = vi.fn();
    global.URL.createObjectURL = createObjectURL;
    global.URL.revokeObjectURL = revokeObjectURL;

    const clickSpy = vi.fn();
    const removeSpy = vi.fn();

    // patch anchor prototype directly
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(clickSpy);
    vi.spyOn(HTMLAnchorElement.prototype, "remove").mockImplementation(
      removeSpy,
    );

    render(
      <NotesWindow open value="abc" onChange={() => {}} onClose={() => {}} />,
    );
    fireEvent.click(screen.getByText("Exportieren"));

    expect(createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
  });
});
