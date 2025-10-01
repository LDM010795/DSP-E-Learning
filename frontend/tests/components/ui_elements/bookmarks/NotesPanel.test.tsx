import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import NotesPanel from "@components/ui_elements/bookmarks/NotesPanel.tsx";

vi.mock("@components/ui_elements/bookmarks/NotesEditor.tsx", () => ({
    default: ({ value, onChange, toolbarRight }: any) => (
        <div>
            <div data-testid="notes-editor">{value}</div>
            <button onClick={() => onChange("new text")}>Change</button>
            {toolbarRight}
        </div>
    ),
}));

describe("NotesPanel", () => {
    it("renders header and character count", () => {
        render(
            <NotesPanel
                value="Hello"
                onChange={() => {}}
                onExport={() => {}}
                onClear={() => {}}
            />
        );

        expect(screen.getByText("Notizen")).toBeInTheDocument();
        expect(screen.getByText("5 Zeichen")).toBeInTheDocument();
        expect(screen.getByTestId("notes-editor")).toHaveTextContent("Hello");
    });

    it("calls onClear when 'Leeren' is clicked", () => {
        const onClear = vi.fn();
        render(
            <NotesPanel
                value=""
                onChange={() => {}}
                onExport={() => {}}
                onClear={onClear}
            />
        );

        fireEvent.click(screen.getByText("Leeren"));
        expect(onClear).toHaveBeenCalled();
    });

    it("calls onExport when 'Exportieren' is clicked", () => {
        const onExport = vi.fn();
        render(
            <NotesPanel
                value=""
                onChange={() => {}}
                onExport={onExport}
                onClear={() => {}}
            />
        );

        fireEvent.click(screen.getByText("Exportieren"));
        expect(onExport).toHaveBeenCalled();
    });

    it("passes onChange to NotesEditor", () => {
        const onChange = vi.fn();
        render(
            <NotesPanel
                value="test"
                onChange={onChange}
                onExport={() => {}}
                onClear={() => {}}
            />
        );

        fireEvent.click(screen.getByText("Change"));
        expect(onChange).toHaveBeenCalledWith("new text");
    });
});