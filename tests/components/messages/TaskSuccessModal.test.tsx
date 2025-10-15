// TaskSuccessModal.test.tsx
import { describe, it, vi, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TaskSuccessModal from "@components/messages/TaskSuccessModal.tsx";

describe("TaskSuccessModal", () => {
  beforeAll(() => {
    vi.mock("react-confetti", () => {
      return {
        default: () => <div data-testid="confetti-mock" />,
      };
    });
  });

  it("does not render when isOpen=false", () => {
    render(
      <TaskSuccessModal
        isOpen={false}
        onClose={vi.fn()}
        taskTitle="Test Task"
        onNextTask={vi.fn()}
      />,
    );
    expect(screen.queryByText("Wow!")).toBeNull();
  });

  it("renders when isOpen=true with taskTitle", () => {
    render(
      <TaskSuccessModal
        isOpen
        onClose={vi.fn()}
        taskTitle="My Task"
        onNextTask={vi.fn()}
      />,
    );
    expect(screen.getByText("Wow!")).toBeInTheDocument();
    expect(screen.getByText("My Task")).toBeInTheDocument();
  });

  it("calls onClose when clicking backdrop", () => {
    const onClose = vi.fn();
    render(
      <TaskSuccessModal
        isOpen
        onClose={onClose}
        taskTitle="My Task"
        onNextTask={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("dialog").parentElement!); // backdrop
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when clicking close button", () => {
    const onClose = vi.fn();
    render(
      <TaskSuccessModal
        isOpen
        onClose={onClose}
        taskTitle="My Task"
        onNextTask={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText("Schließen"));
    expect(onClose).toHaveBeenCalled();
  });

  it("shows correct button label for non-last task", () => {
    render(
      <TaskSuccessModal
        isOpen
        onClose={vi.fn()}
        taskTitle="My Task"
        onNextTask={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Weiter zur nächsten Aufgabe" }),
    ).toBeInTheDocument();
  });

  it("shows correct button label for last task", () => {
    render(
      <TaskSuccessModal
        isOpen
        onClose={vi.fn()}
        taskTitle="My Task"
        onNextTask={vi.fn()}
        isLastTask
      />,
    );
    expect(
      screen.getByRole("button", { name: "Zur Modulübersicht" }),
    ).toBeInTheDocument();
  });

  it("calls onNextTask when clicking primary button", () => {
    const onNextTask = vi.fn();
    render(
      <TaskSuccessModal
        isOpen
        onClose={vi.fn()}
        taskTitle="My Task"
        onNextTask={onNextTask}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Weiter zur nächsten Aufgabe" }),
    );
    expect(onNextTask).toHaveBeenCalled();
  });
});
