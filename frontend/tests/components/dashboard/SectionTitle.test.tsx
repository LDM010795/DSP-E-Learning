/**
 * Tests for SectionTitle component.
 * Verifies that:
 *  - It renders the title text correctly
 *  - It optionally displays an icon before the text
 *
 * Author: DSP Development Team
 * Date: 2025-10-29
 */
import { render, screen } from "@testing-library/react";
import { IoBookOutline } from "react-icons/io5";
import SectionTitle from "../../../src/components/dashboard/SectionTitle";

describe("SectionTitle", () => {
    test("renders title text", () => {
        render(<SectionTitle>Aktive Module</SectionTitle>);
        expect(screen.getByText("Aktive Module")).toBeInTheDocument();
    });

    test("renders icon when provided", () => {
        render(<SectionTitle icon={<IoBookOutline />} children="Test" />);
        expect(screen.getByTestId("section-icon")).toBeInTheDocument();
    });
});
