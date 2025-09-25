/**
 *
 * Unit tests for the PopupExamOverview component:
 * - Verify correct rendering of exam details (title, description, difficulty, requirements).
 * - Check module prerequisites logic (completed vs. not completed → line-through class).
 * - Validate behavior depending on exam attempt status:
 *    - Available: show "Prüfung jetzt starten"
 *    - Started: show "Abgabe vorbereiten"
 *    - Graded: show result + feedback
 * - Ensure interaction handlers (onClose, onStartExam, onPrepareSubmission) are called.
 *
 * Test Strategy:
 * - Mock `useModules` context via `mockModules` (so we can simulate completed/incomplete modules).
 * - Use helper factories (`makeExam`, `makeAttempt`) to generate valid Exam/ExamAttempt objects
 *   with realistic default values while allowing overrides.
 * - Use React Testing Library + userEvent to render, query, and interact with the component.
 *
 * Author: DSP development Team
 * Date: 2025-09-25
 */



import { mockModules } from "../../test-utils";

// --- Context mocking must be set up BEFORE importing the component ---
// This ensures that when PopupExamOverview imports useModules,
// it receives our mocked implementation instead of the real one.
mockModules([
  { id: 1, tasks: [] },                      // completed
  { id: 2, tasks: [{ completed: false }] },  // not completed
]);


import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PopupExamOverview from '../../../src/components/pop_ups/popup_exam_overview';
import type { Exam, ExamAttempt, Criterion, ExamRequirement, Module } from '../../../src/context/ExamContext';

// These helper functions produce valid objects for Exam/ExamAttempt,
function makeModule(id: number, title: string): Module {
  return {
    id,
    title,
    updated_at: '2025-01-01T00:00:00.000Z',
    modules: [],
    criteria: [],
    requirements: [],
  };
}

function makeExam(overrides: Partial<Exam> = {}): Exam {
  const criteria: Criterion[] = [
    { id: 201, title: 'Kriterium 1', description: '...', max_points: 30 },
    { id: 202, title: 'Kriterium 2', description: '...', max_points: 20 },
  ];
  const requirements: ExamRequirement[] = [
    { id: 10, description: 'Req A', order: 1 },
    { id: 11, description: 'Req B', order: 2 },
  ];

  return {
    id: 1,
    exam_title: 'DSP Abschlussprüfung',
    exam_description: 'Zeile 1\n\nZeile 3',
    exam_difficulty: 'medium',
    exam_duration_week: 2,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-02T00:00:00.000Z',
    modules: [makeModule(1, 'Modul 1'), makeModule(2, 'Modul 2')],
    criteria,
    requirements,
    ...overrides, // allows per-test customization
  };
}

function makeAttempt(overrides: Partial<ExamAttempt> = {}): ExamAttempt {
  return {
    id: 99,
    exam: makeExam(),
    user: {
      id: 7,
      username: 'student',
      first_name: 'Stu',
      last_name: 'Dent',
      email: 'student@example.com',
    },
    status: 'started', // default: a started attempt
    started_at: '2025-09-10T10:00:00.000Z',
    submitted_at: null,
    graded_at: null,
    score: null,
    feedback: null,
    due_date: '2025-09-17T10:00:00.000Z',
    remaining_days: 7,
    processing_time_days: null,
    criterion_scores: [],
    attachments: [],
    graded_by: null,
    ...overrides,
  };
}

// --- Test Suite ---

describe('PopupExamOverview', () => {
  test('renders header, difficulty badge, description, and sorted requirements', () => {
    render(
      <MemoryRouter>
        <PopupExamOverview exam={makeExam()} onClose={vi.fn()} />
      </MemoryRouter>
    );

    // Header and difficulty badge
    expect(screen.getByText('DSP Abschlussprüfung')).toBeInTheDocument();
    expect(screen.getByText('Mittel')).toBeInTheDocument();

    // Description paragraphs
    expect(screen.getByText('Zeile 1')).toBeInTheDocument();
    expect(screen.getByText('Zeile 3')).toBeInTheDocument();

    // Requirements sorted by order
    const reqItems = screen.getAllByText(/Req [AB]/);
    expect(reqItems[0]).toHaveTextContent('Req A');
    expect(reqItems[1]).toHaveTextContent('Req B');
  });

  test('marks completed prerequisite modules with line-through', () => {
    render(
      <MemoryRouter>
        <PopupExamOverview exam={makeExam()} onClose={vi.fn()} />
      </MemoryRouter>
    );

    // Modul 1 is completed per mocked useModules -> should be line-through
    const link1 = screen.getByRole('link', { name: 'Modul 1' }) as HTMLAnchorElement;
    expect(link1).toHaveClass('line-through');

    // Modul 2 is not completed -> no line-through
    const link2 = screen.getByRole('link', { name: 'Modul 2' }) as HTMLAnchorElement;
    expect(link2).not.toHaveClass('line-through');
  });

  test('shows "Prüfung jetzt starten" when available and calls callbacks', async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    const onClose = vi.fn();

    // When no attempt is passed → exam is "available"
    render(
      <MemoryRouter>
        <PopupExamOverview exam={makeExam()} onClose={onClose} onStartExam={onStart} />
      </MemoryRouter>
    );

    const startBtn = screen.getByRole('button', { name: 'Prüfung jetzt starten' });
    await user.click(startBtn);

    expect(onStart).toHaveBeenCalledWith(1);
    expect(onClose).toHaveBeenCalled();
  });

  test('shows "Abgabe vorbereiten" when attempt is started', () => {
    const attempt = makeAttempt({
      status: 'started',
      started_at: '2025-09-10T10:00:00.000Z',
      due_date: '2025-09-17T10:00:00.000Z',
    });

    render(
      <MemoryRouter>
        <PopupExamOverview exam={makeExam()} attempt={attempt} onClose={vi.fn()} onPrepareSubmission={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: 'Abgabe vorbereiten' })).toBeInTheDocument();
  });

  test('graded attempt shows Ergebnis and Feedback', () => {
    const attempt = makeAttempt({
      status: 'graded',
      started_at: '2025-09-01T09:00:00.000Z',
      submitted_at: '2025-09-02T09:00:00.000Z',
      graded_at: '2025-09-03T09:00:00.000Z',
      score: 42,
      feedback: 'Sehr gut gemacht!',
    });

    render(
      <MemoryRouter>
        <PopupExamOverview exam={makeExam()} attempt={attempt} onClose={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText(/42 \/ 50 Pkt\./)).toBeInTheDocument();
    expect(screen.getByText('Sehr gut gemacht!')).toBeInTheDocument();
  });

  test('clicking prerequisite link triggers onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <MemoryRouter>
        <PopupExamOverview exam={makeExam()} onClose={onClose} />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('link', { name: 'Modul 1' }));
    expect(onClose).toHaveBeenCalled();
  });

  test('secondary close button calls onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <MemoryRouter>
        <PopupExamOverview exam={makeExam()} onClose={onClose} />
      </MemoryRouter>
    );

    // Footer "Schließen" button (not the header X)
    const buttons = screen.getAllByRole('button', { name: 'Schließen' });
    await user.click(buttons[buttons.length - 1]);

    expect(onClose).toHaveBeenCalled();
  });
});
