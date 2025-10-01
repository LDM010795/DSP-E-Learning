import { render, screen, fireEvent } from "@testing-library/react";
import BackToTopButton from "@components/ui_elements/buttons/BackToTopButton.tsx";
import { vi } from "vitest";

describe("BackToTopButton", () => {
    beforeEach(() => {
        // reset scroll position
        Object.defineProperty(window, "scrollY", { value: 0, writable: true });
    });

    it("is hidden initially", () => {
        render(<BackToTopButton threshold={200} />);
        const button = screen.getByRole("button", { name: /nach oben scrollen/i });
        expect(button).toHaveClass("opacity-0");
    });

    it("becomes visible when scrolled beyond threshold", () => {
        render(<BackToTopButton threshold={200} />);
        const button = screen.getByRole("button", { name: /nach oben scrollen/i });

        // simulate scroll
        window.scrollY = 300;
        fireEvent.scroll(window);

        expect(button).toHaveClass("opacity-100");
    });

    it("calls window.scrollTo on click", () => {
        const scrollToMock = vi.fn();
        window.scrollTo = scrollToMock;

        render(<BackToTopButton threshold={0} />);
        const button = screen.getByRole("button", { name: /nach oben scrollen/i });

        fireEvent.click(button);

        expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    });
});