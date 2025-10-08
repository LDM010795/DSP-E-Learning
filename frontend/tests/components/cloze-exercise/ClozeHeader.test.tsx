import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import ClozeHeader from "@/components/ui_elements/cloze_exercise/ClozeHeader";

describe("ClozeHeader", () => {
    it("renders Title", () => {
        const title = "Fülle die Lücken aus:";
        render(<ClozeHeader title={title} />);
        const heading = screen.getByRole("heading", { name: title, level: 1 });
        expect(heading).toBeInTheDocument();
    });
});
