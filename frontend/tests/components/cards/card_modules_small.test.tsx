import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CardModulesSmall from "../../../src/components/cards/card_modules_small.tsx";

describe("CardModulesSmall", () => {
  test("renders title, difficultyTag, status and progress", () => {
    render(
      <CardModulesSmall
        title="Module 1"
        progress={65}
        status="In Bearbeitung"
        difficultyTag={<span>Easy</span>}
      />,
    );

    expect(screen.getByText("Module 1")).toBeInTheDocument();
    expect(screen.getByText("Easy")).toBeInTheDocument();
    expect(screen.getByText("In Bearbeitung")).toBeInTheDocument();
    expect(screen.getByText("65%")).toBeInTheDocument();
  });

  test("click triggers onClick", async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(
      <CardModulesSmall
        title="Module 2"
        progress={0}
        status="Nicht begonnen"
        difficultyTag={<span>Medium</span>}
        onClick={fn}
      />,
    );
    await user.click(screen.getByText("Module 2"));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
