/**
 * These tests verify that TableModules correctly:
 *  - Renders module rows (title, category, progress %)
 *  - Sorts rows when clicking sortable headers (e.g., Title)
 *  - Navigates to `/modules/:id` when a row is clicked
 *
 * Approach:
 *  - Use real `Module` type (shape) for fixtures
 *  - Mock `useNavigate` to assert routing intent
 *  - Mock TagCalculatedDifficulty to keep tests focused on the table behavior
 *
 * Authors: DSP Development Team
 * Date: 23-09-2025
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { Module } from '../../../src/context/ModuleContext.tsx';
import TableModules from '../../../src/components/tables/table_modules.tsx';

// Mock TagCalculatedDifficulty to a simple marker to keep tests focused
vi.mock('../../../src/components/tags/tag_calculated_difficulty.tsx', () => ({
  default: ({ tasks }: { tasks: unknown[] }) => (
    <span data-testid="diff-tag">{`DiffTag(${Array.isArray(tasks) ? tasks.length : 0})`}</span>
  ),
}));

// Mock useNavigate so we can assert navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});


function renderWithRouter(ui: React.ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

// Minimal Module fixture helper
function makeModule(
  id: number,
  title: string,
  {
    categoryName = 'Kategorie',
    tasks = [],
  }: {
    categoryName?: string;
    tasks?: Array<{ completed: boolean; difficulty?: 'Einfach' | 'Mittel' | 'Schwer' }>;
  } = {}
): Module {
  return {
    id,
    title,
    // fields used by TableModules:
    category: categoryName ? { id: 1, name: categoryName } : (null as unknown as Module['category']),
    tasks,
    // unused fields can be stubbed as needed
    description: '',
    updated_at: '2025-01-01T00:00:00Z',
    contents: [],
  } as unknown as Module;
}

describe('TableModules', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  const modules: Module[] = [
    makeModule(1, 'Algorithms', {
      categoryName: 'CS',
      tasks: [
        { completed: true, difficulty: 'Mittel' },
        { completed: false, difficulty: 'Mittel' },
      ],
    }),
    makeModule(2, 'Data Structures', {
      categoryName: 'CS',
      tasks: [
        { completed: true, difficulty: 'Schwer' },
        { completed: true, difficulty: 'Schwer' },
        { completed: false, difficulty: 'Schwer' },
      ],
    }),
    makeModule(3, 'Intro', {
      categoryName: 'Basics',
      tasks: [], // no tasks -> 0%
    }),
  ];

  test('renders rows with title, category and progress percentage', () => {
    renderWithRouter(<TableModules modules={modules} />);

    // Titles
    expect(screen.getByText('Algorithms')).toBeInTheDocument();
    expect(screen.getByText('Data Structures')).toBeInTheDocument();
    expect(screen.getByText('Intro')).toBeInTheDocument();

    // Categories
    expect(screen.getAllByText(/CS|Basics/).length).toBeGreaterThan(0);

    // Progress percentages:
    // Algorithms: 1/2 => 50%
    expect(screen.getByText('50%')).toBeInTheDocument();
    // Data Structures: 2/3 => 67%
    expect(screen.getByText('67%')).toBeInTheDocument();
    // Intro: 0/0 => 0%
    expect(screen.getByText('0%')).toBeInTheDocument();

    // Difficulty tag placeholder (mocked)
    expect(screen.getAllByTestId('diff-tag').length).toBe(3);
  });

  test('navigates to module details when row is clicked', () => {
    renderWithRouter(<TableModules modules={modules} />);

    // Click by title cell (any cell in the row will work; title is easiest)
    fireEvent.click(screen.getByText('Algorithms'));
    expect(mockNavigate).toHaveBeenCalledWith('/modules/1');

    fireEvent.click(screen.getByText('Data Structures'));
    expect(mockNavigate).toHaveBeenCalledWith('/modules/2');
  });

  test('sorts by Title when header clicked', () => {
    renderWithRouter(<TableModules modules={modules} />);

    // Initial order is determined by default sort (status asc).
    // We force a Title sort by clicking the header.
    fireEvent.click(screen.getByText('Titel')); // first click -> asc by title

    // Collect titles in their rendered order
    const titleCells = screen.getAllByText(/Algorithms|Data Structures|Intro/);
    const orderAsc = titleCells.map((el) => el.textContent);
    // Ascending alphabetical should be: Algorithms, Data Structures, Intro
    expect(orderAsc).toEqual(['Algorithms', 'Data Structures', 'Intro']);

    // Click again -> desc
    fireEvent.click(screen.getByText('Titel'));
    const titleCellsDesc = screen.getAllByText(/Algorithms|Data Structures|Intro/);
    const orderDesc = titleCellsDesc.map((el) => el.textContent);
    // Descending: Intro, Data Structures, Algorithms
    expect(orderDesc).toEqual(['Intro', 'Data Structures', 'Algorithms']);
  });
});
