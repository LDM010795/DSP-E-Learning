import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import ClozeSubmitButton from "@/components/ui_elements/cloze_exercise/ClozeSubmitButton";

describe("ClozeSubmitButton", () => {
    it("rendert das übergebene Label", () => {
        render(<ClozeSubmitButton disabled={false} label="Prüfen" onClick={() => { }} />);
        expect(screen.getByRole("button", { name: "Prüfen" })).toBeInTheDocument();
    });

    it("ruft onClick auf, wenn enabled", () => {
        const onClick = vi.fn();
        render(<ClozeSubmitButton disabled={false} label="OK" onClick={onClick} />);

        fireEvent.click(screen.getByRole("button", { name: "OK" }));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("ruft onClick NICHT auf, wenn disabled", () => {
        const onClick = vi.fn();
        render(<ClozeSubmitButton disabled={true} label="OK" onClick={onClick} />);

        const btn = screen.getByRole("button", { name: "OK" });
        expect(btn).toBeDisabled();

        fireEvent.click(btn);
        expect(onClick).not.toHaveBeenCalled();
    });
});
