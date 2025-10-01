import { render, fireEvent } from "@testing-library/react";
import { vi } from "vitest";

// mock sanitizeHtmlBasic
vi.mock("@components/ui_elements/bookmarks/utils.ts", () => ({
    sanitizeHtmlBasic: vi.fn((x) => `sanitized(${x})`),
}));

import NotesEditor from "@components/ui_elements/bookmarks/NotesEditor.tsx";
import { sanitizeHtmlBasic} from "@components/ui_elements/bookmarks/utils.ts";

// stub execCommand
beforeEach(() => {
    document.execCommand = vi.fn();
});

describe("NotesEditor", () => {
    it("renders with initial value", () => {
        const { getByLabelText } = render(
            <NotesEditor value="<p>hello</p>" onChange={() => {}} />
        );
        expect(getByLabelText("Eigene Notizen").innerHTML).toContain("hello");
    });

    it("calls onChange when user types", () => {
        const onChange = vi.fn();
        const { getByLabelText } = render(
            <NotesEditor value="" onChange={onChange} />
        );
        const editor = getByLabelText("Eigene Notizen");

        editor.innerHTML = "<b>typed</b>";
        fireEvent.input(editor);

        expect(sanitizeHtmlBasic).toHaveBeenCalledWith("<b>typed</b>");
        expect(onChange).toHaveBeenCalledWith("sanitized(<b>typed</b>)");
    });

    it("executes command when toolbar button clicked", () => {
        const onChange = vi.fn();
        const { getByLabelText } = render(
            <NotesEditor value="foo" onChange={onChange} />
        );

        fireEvent.click(getByLabelText("Fett"));
        expect(document.execCommand).toHaveBeenCalledWith("bold", false, undefined);
    });

    it("handles paste event with sanitization", () => {
        const onChange = vi.fn();
        const { getByLabelText } = render(
            <NotesEditor value="" onChange={onChange} />
        );
        const editor = getByLabelText("Eigene Notizen");

        const pasteData = {
            getData: (type: string) =>
                type === "text/html" ? "<script>bad()</script>" : "",
        };
        const pasteEvent = new Event("paste", { bubbles: true, cancelable: true });
        Object.defineProperty(pasteEvent, "clipboardData", {
            value: pasteData,
        });

        fireEvent(editor, pasteEvent);

        expect(sanitizeHtmlBasic).toHaveBeenCalled();
        expect(document.execCommand).toHaveBeenCalledWith(
            "insertHTML",
            false,
            expect.stringContaining("sanitized")
        );
        expect(onChange).toHaveBeenCalled();
    });

    it("renders toolbarRight content", () => {
        const { getByText } = render(
            <NotesEditor value="" onChange={() => {}} toolbarRight={<span>Extra</span>} />
        );
        expect(getByText("Extra")).toBeInTheDocument();
    });
});