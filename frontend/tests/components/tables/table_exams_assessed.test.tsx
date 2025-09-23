/**
 * These tests verify that the TableExamsAssessed component correctly:
 *  - Renders exam attempts with exam title, student name, status, and scores
 *  - Displays computed percentage bars for graded attempts
 *  - Shows an empty state when no attempts are provided
 *  - Triggers the `onRowClick` callback with the attempt ID on row click
 *  - Sorts rows when clicking on sortable column headers (e.g., exam title)
 *
 * Approach:
 *  - Use the real `ExamAttempt` type from ExamContext
 *  - Provide minimal but complete mock attempts via helper functions
 *  - Simulate user interactions with Testing Library (clicks on rows/headers)
 *  - Assert rendered DOM content (titles, scores, status badges, empty state)
 *
 *  Authors: DSP Development Team
 *  Date: 23-09-2025
 */


import { render, screen, fireEvent } from '@testing-library/react';
import TableExamsAssessed from '../../../src/components/tables/table_exams_assessed.tsx';
import type { ExamAttempt, Exam, Criterion } from '../../../src/context/ExamContext.tsx';

function makeCriterion(id: number, max: number): Criterion {
  return {
    id,
    title: `Crit ${id}`,
    description: '',
    max_points: max,
  };
}

function makeExam(id: number, title: string, criteria: Criterion[]): Exam {
  return {
    id,
    exam_title: title,
    exam_description: '',
    exam_difficulty: 'easy',
    exam_duration_week: 4,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    modules: [],
    criteria,
    requirements: [],
  };
}

function makeAttempt(overrides: Partial<ExamAttempt>): ExamAttempt {
  // Provide a complete ExamAttempt with sensible defaults; override per test
  return {
    id: 999,
    status: 'submitted',
    exam: makeExam(1, 'Default Exam', [makeCriterion(1, 100)]),
    user: { id: 1, username: 'user' },
    started_at: '2025-01-01T09:00:00Z',
    submitted_at: '2025-01-01T10:00:00Z',
    graded_at: null,
    score: null,
    feedback: null,
    due_date: null,
    remaining_days: null,
    processing_time_days: null,
    criterion_scores: [],
    graded_by: null,
    ...overrides,
  };
}

describe('TableExamsAssessed', () => {
  const attempts: ExamAttempt[] = [
      makeAttempt({
        id: 1,
        status: 'graded',
        exam: makeExam(10, 'Math Exam', [makeCriterion(1, 50)]),
        user: { id: 101, username: 'alice' },
        submitted_at: '2025-01-01T10:00:00Z',
        graded_at: '2025-01-01T12:00:00Z',
        score: 45,
        graded_by: { id: 500, username: 'teacher1' },
      }),
      makeAttempt({
        id: 2,
        status: 'submitted',
        exam: makeExam(11, 'History Exam', [makeCriterion(1, 100)]),
        user: { id: 102, username: 'bob' },
        submitted_at: '2025-02-01T10:00:00Z',
        score: null,
        graded_by: null,
      }),
  ];

  test('renders attempts with title, user, status, and computed score/percentage', () => {
    render(<TableExamsAssessed attempts={attempts} onRowClick={() => {}} />);

    // Titles & users
    expect(screen.getByText('Math Exam')).toBeInTheDocument();
    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByText('History Exam')).toBeInTheDocument();
    expect(screen.getByText('bob')).toBeInTheDocument();

    // Status display uses title attribute for the human-readable label
    expect(screen.getByTitle('Bewertet')).toBeInTheDocument();   // graded
    expect(screen.getByTitle('Eingereicht')).toBeInTheDocument(); // submitted

    // Score & percentage for graded attempt: 45/50 = 90%
    expect(screen.getByText(/45\.00 \/ 50/)).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();

    // Submitted attempt has no score
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  test('clicking a row triggers onRowClick with the attempt id', () => {
    const handleClick = vi.fn();
    render(<TableExamsAssessed attempts={attempts} onRowClick={handleClick} />);

    // Click on the row by clicking a cell text (title)
    fireEvent.click(screen.getByText('Math Exam'));
    expect(handleClick).toHaveBeenCalledWith(1);
  });

  test('renders empty state when no attempts are provided', () => {
    render(<TableExamsAssessed attempts={[]} onRowClick={() => {}} />);

    expect(
      screen.getByText('Keine bewerteten Prüfungen gefunden.')
    ).toBeInTheDocument();
  });

  test('sorts by exam title when clicking the header', () => {
    render(<TableExamsAssessed attempts={attempts} onRowClick={() => {}} />);

    // Click "Prüfungstitel" to sort ascending
    fireEvent.click(screen.getByText('Prüfungstitel'));

    // After ascending sort, "History Exam" should come before "Math Exam" in DOM order
    const titles = screen.getAllByText(/Exam$/).map((el) => el.textContent);
    // Expect array like ['History Exam', 'Math Exam']
    expect(titles[0]).toBe('History Exam');
    expect(titles[1]).toBe('Math Exam');
  });
});
