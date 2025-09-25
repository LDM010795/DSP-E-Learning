/**
 * CardChapter Component Tests
 *
 * These tests verify the rendering and behavior of the CardChapter component:
 *  - Displays the chapter title and optional description
 *  - Shows the number of videos and tasks with correct pluralization
 *  - Computes and displays the completion progress percentage
 *    based on the ratio of completed tasks to total tasks
 *  - Calls the onClick callback when the card is clicked
 *
 * Example test data:
 *  - 3 videos
 *  - 3 tasks (2 completed, 1 incomplete) → 67% abgeschlossen
 *
 * Author: DSP Development Team
 * Date: 25-09-2025
 */


import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CardChapter from '../../../src/components/cards/card_chapter.tsx';

type ChapterLike = {
  title: string;
  description?: string;
  contents: unknown[];
  tasks: { completed: boolean }[];
};

describe("CardChapter", () => {
  const base: ChapterLike = {
    title: "Chapter A",
    description: "Basics",
    contents: [{}, {}, {}], // 3 videos
    tasks: [{ completed: true }, { completed: true }, { completed: false }], // 2/3 -> 67%
  };

  test("renders title, description, video/task counts and progress", () => {
    render(<CardChapter chapter={base as any} />);

    expect(screen.getByText("Chapter A")).toBeInTheDocument();
    expect(screen.getByText("Basics")).toBeInTheDocument();

    // "3 Videos" (plural) and "3 Aufgaben" (plural)
    expect(screen.getByText(/3 Videos/i)).toBeInTheDocument();
    expect(screen.getByText(/3 Aufgaben/i)).toBeInTheDocument();

    // Computed progress
    expect(screen.getByText(/67% abgeschlossen/i)).toBeInTheDocument();
  });

  test("click triggers onClick", async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<CardChapter chapter={base as any} onClick={fn} />);
    await user.click(screen.getByText("Chapter A"));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
