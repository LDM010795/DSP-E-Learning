import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ClozeBlankTextSlot from "@/components/ui_elements/cloze_exercise/blanks/ClozeBlankTextSlot";
import { CLOZE_BLANK_STYLES } from "@/components/ui_elements/cloze_exercise/blanks/ClozeBlankBase"

const styles = CLOZE_BLANK_STYLES["text"];

describe("ClozeBlankTextSlot", () => {
    it("rendert ein input mit anfänglichem Wert", () => {
        render(
            <ClozeBlankTextSlot
                id="t1"
                inputValue="Hallo"
                display_mode="text"
            />,
        );

        const input = screen.getByRole("textbox");
        expect(input).toBeInTheDocument();
        expect(input).toHaveValue("Hallo");
        // Wrapper hat die passende Klasse
        const wrapper = input.closest("span");
        expect(wrapper).toHaveClass(styles.inputWrap);
    });

    it("rendert leeres input, wenn kein inputValue übergeben ist", () => {
        render(<ClozeBlankTextSlot id="t2" inputValue="" display_mode="text" />);
        const input = screen.getByRole("textbox");
        expect(input).toHaveValue("");
    });

    it("ruft onInputChange mit neuem Wert auf", () => {
        const onInputChange = vi.fn();
        render(
            <ClozeBlankTextSlot
                id="t3"
                inputValue=""
                onInputChange={onInputChange}
                display_mode="text"
            />,
        );

        const input = screen.getByRole("textbox");

        fireEvent.change(input, { target: { value: "Test" } });

        expect(onInputChange).toHaveBeenCalledTimes(1);
        expect(onInputChange).toHaveBeenCalledWith("Test");
    });

    it("passt style.width dynamisch an, mindestens 4ch", () => {
        const onInputChange = vi.fn();
        render(
            <ClozeBlankTextSlot
                id="t4"
                inputValue=""
                onInputChange={onInputChange}
                display_mode="text"
            />,
        );

        const input = screen.getByRole("textbox") as HTMLInputElement;

        // Anfangsbreite
        expect(input.style.width).toBe("4ch");

        // Nach Änderung: Länge = 6, also 6ch
        fireEvent.change(input, { target: { value: "abcdef" } });
        expect(input.style.width).toBe("6ch");
    });

    it("lässt Breite nie unter 4ch fallen", () => {
        const onInputChange = vi.fn();
        render(
            <ClozeBlankTextSlot
                id="t5"
                inputValue="abcd"
                onInputChange={onInputChange}
                display_mode="text"
            />,
        );

        const input = screen.getByRole("textbox") as HTMLInputElement;

        fireEvent.change(input, { target: { value: "" } });
        expect(input.style.width).toBe("4ch");
    });

    it("nutzt immer die Klassen aus CLOZE_BLANK_STYLES", () => {
        render(
            <ClozeBlankTextSlot
                id="t6"
                inputValue=""
                display_mode="text"
            />,
        );

        const input = screen.getByRole("textbox");
        expect(input).toHaveClass(styles.input);
    });
});
