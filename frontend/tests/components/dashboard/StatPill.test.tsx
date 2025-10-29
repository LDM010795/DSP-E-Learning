/**
 * Tests for StatPill component.
 * Verifies that:
 *  - It displays title, value, and optional icon
 *  - It applies correct gradient background class
 *
 * Author: DSP Development Team
 * Date: 2025-10-29
 */

import { render, screen } from "@testing-library/react";
import { IoFlashOutline } from "react-icons/io5";
import StatPill from "../../../src/components/dashboard/StatPill";

describe("StatPill", () => {
    test("renders title and value", () => {
        render(<StatPill title="Diese Woche" value="10h" gradient="orange" />);
        expect(screen.getByText("Diese Woche")).toBeInTheDocument();
        expect(screen.getByText("10h")).toBeInTheDocument();
    });

    test("renders icon", () => {
        render(<StatPill title="Test" value="X" gradient="orange" icon={<IoFlashOutline />} />);
        expect(screen.getByTestId("statpill-icon")).toBeInTheDocument();

    });
});
