// Accordion.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {Accordion, AccordionItem} from "@components/ui_elements/accordions/accordion.tsx";

describe("Accordion", () => {
    it("renders children", () => {
        render(
            <Accordion>
                <AccordionItem id="a1" title="Item 1">
                    Content 1
                </AccordionItem>
            </Accordion>,
        );

        expect(screen.getByText("Item 1")).toBeInTheDocument();
    });

    it("respects defaultOpenId", () => {
        render(
            <Accordion defaultOpenId="a1">
                <AccordionItem id="a1" title="Item 1">
                    Content 1
                </AccordionItem>
                <AccordionItem id="a2" title="Item 2">
                    Content 2
                </AccordionItem>
            </Accordion>,
        );

        expect(screen.getByText("Content 1")).toBeInTheDocument();
        expect(screen.queryByText("Content 2")).not.toBeInTheDocument();
    });

    it("toggles content on click", () => {
        render(
            <Accordion>
                <AccordionItem id="a1" title="Item 1">
                    Content 1
                </AccordionItem>
            </Accordion>,
        );

        const button = screen.getByRole("button", { name: /item 1/i });

        // initially closed
        expect(screen.queryByText("Content 1")).not.toBeInTheDocument();
        expect(button).toHaveAttribute("aria-expanded", "false");

        // open
        fireEvent.click(button);
        expect(screen.getByText("Content 1")).toBeInTheDocument();
        expect(button).toHaveAttribute("aria-expanded", "true");

        // close again
        fireEvent.click(button);
        expect(screen.queryByText("Content 1")).not.toBeInTheDocument();
        expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("only one item stays open at a time", () => {
        render(
            <Accordion>
                <AccordionItem id="a1" title="Item 1">
                    Content 1
                </AccordionItem>
                <AccordionItem id="a2" title="Item 2">
                    Content 2
                </AccordionItem>
            </Accordion>,
        );

        const button1 = screen.getByRole("button", { name: /item 1/i });
        const button2 = screen.getByRole("button", { name: /item 2/i });

        fireEvent.click(button1);
        expect(screen.getByText("Content 1")).toBeInTheDocument();

        fireEvent.click(button2);
        expect(screen.getByText("Content 2")).toBeInTheDocument();
        expect(screen.queryByText("Content 1")).not.toBeInTheDocument();
    });
});