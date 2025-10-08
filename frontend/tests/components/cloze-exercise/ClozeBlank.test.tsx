import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import ClozeBlank from "@/components/ui_elements/cloze_exercise/ClozeBlank";

// kleines Helferlein für dataTransfer im DnD
function createDataTransfer(initial: Record<string, string> = {}) {
    const store = { ...initial };
    return {
        setData: vi.fn((key: string, val: string) => { store[key] = val; }),
        getData: vi.fn((key: string) => store[key]),
        dropEffect: "move",
        effectAllowed: "all",
        files: [],
        items: [],
        types: Object.keys(store),
    } as unknown as DataTransfer;
}

describe("ClozeBlank", () => {
    it("Input-Modus: ruft onInputChange mit neuem Wert auf", () => {
        const onInputChange = vi.fn();
        render(
            <ClozeBlank
                id="b1"
                showSolutionWords={false}
                inputValue=""
                onInputChange={onInputChange}
            />
        );

        const input = screen.getByRole("textbox");
        fireEvent.change(input, { target: { value: "Antwort" } });

        expect(onInputChange).toHaveBeenCalledTimes(1);
        expect(onInputChange).toHaveBeenCalledWith("Antwort");
    });

    it("DnD-Modus: zeigt currentWord-Text an, wenn belegt", () => {
        render(
            <ClozeBlank
                id="b1"
                showSolutionWords
                currentWord={{ id: "w1", word: "Haus" }}
            />
        );
        expect(screen.getByText("Haus")).toBeInTheDocument();
    });

    it("DnD-Modus: Drop triggert onDropWord mit wordId aus dataTransfer", () => {
        const onDropWord = vi.fn();
        render(<ClozeBlank id="b1" showSolutionWords onDropWord={onDropWord} />);

        const blank = screen.getByTestId("blank-b1");
        const dt = createDataTransfer({ wordId: "w42" });

        // dragOver, dann drop (preventDefault wird intern aufgerufen)
        fireEvent.dragOver(blank, { dataTransfer: dt });
        fireEvent.drop(blank, { dataTransfer: dt });

        expect(onDropWord).toHaveBeenCalledTimes(1);
        expect(onDropWord).toHaveBeenCalledWith("w42");
    });

    it("DnD-Modus: Ctrl/Cmd-Klick auf belegte Lücke ruft onCtrlClear mit aktueller wordId", () => {
        const onCtrlClear = vi.fn();
        render(
            <ClozeBlank
                id="b1"
                showSolutionWords
                currentWord={{ id: "w1", word: "Haus" }}
                onCtrlClear={onCtrlClear}
            />
        );

        const blank = screen.getByTestId("blank-b1");
        fireEvent.click(blank, { ctrlKey: true });

        expect(onCtrlClear).toHaveBeenCalledTimes(1);
        expect(onCtrlClear).toHaveBeenCalledWith("w1");
    });

    it("DnD-Modus: Ctrl/Cmd-Klick macht nichts, wenn kein currentWord gesetzt ist", () => {
        const onCtrlClear = vi.fn();
        render(
            <ClozeBlank
                id="b1"
                showSolutionWords
                currentWord={null}
                onCtrlClear={onCtrlClear}
            />
        );

        const blank = screen.getByTestId("blank-b1");
        fireEvent.click(blank, { metaKey: true }); // macOS-Variante

        expect(onCtrlClear).not.toHaveBeenCalled();
    });

    it("Drop ohne onDropWord verursacht keinen Fehler", () => {
        render(<ClozeBlank id="b1" showSolutionWords />);
        const blank = screen.getByTestId("blank-b1");
        const dt = createDataTransfer({ wordId: "wX" });

        // Erwartung: kein Throw
        expect(() => {
            fireEvent.dragOver(blank, { dataTransfer: dt });
            fireEvent.drop(blank, { dataTransfer: dt });
        }).not.toThrow();
    });
});
