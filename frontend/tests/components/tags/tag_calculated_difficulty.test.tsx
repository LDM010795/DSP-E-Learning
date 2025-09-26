/**
 * Tests for TagCalculatedDifficulty component
 * - Verifies that the component calculates the average difficulty
 *   of a given set of tasks and renders the correct difficulty tag.
 * - Ensures correct behavior when no tasks are provided.
 * - Ensures mapping logic from average score to difficulty levels works:
 *    Einfach (avg < 1.7) → green tag
 *    Mittel  (1.7 ≤ avg ≤ 2.3) → yellow tag
 *    Schwer  (avg > 2.3) → red tag
 *
 * Author: DSP Development Team
 * Date: 2025-09-26
 */


import { render, screen } from '@testing-library/react';
import TagCalculatedDifficulty from '../../../src/components/tags/tag_calculated_difficulty';
import type { Task } from '../../../src/context/ModuleContext';

/**
 * Helper to construct a minimal Task object.
 * Only the `difficulty` field matters for these tests,
 * other fields are stubbed with dummy values.
 */
function t(difficulty: Task['difficulty']): Task {
    return {
        id: 1,
        title: 'x',
        description: '',
        difficulty,
        // add any extra Task fields here if the ModuleContext requires them
        completed: false,
    } as unknown as Task;
}

describe('TagCalculatedDifficulty', () => {
    test('returns null when tasks is empty/undefined', () => {
        // Case 1: tasks = []
        const { container: c1 } = render(<TagCalculatedDifficulty tasks={[]} />);
        expect(c1.firstChild).toBeNull();

        // Case 2: tasks = undefined
        const { container: c2 } = render(<TagCalculatedDifficulty tasks={undefined} />);
        expect(c2.firstChild).toBeNull();
    });

    test('calculates "Einfach" for low average (< 1.7)', () => {
        // Einfach=1, Mittel=2, Schwer=3 → avg of [1,1,2] = 1.33 → "Einfach"
        render(<TagCalculatedDifficulty tasks={[t('Einfach'), t('Einfach'), t('Mittel')]} />);
        const tag = screen.getByText('Einfach');


        expect(tag).toBeInTheDocument();
        expect(tag.className).toContain('bg-green-100');
        expect(tag.className).toContain('text-green-800');
    });

    test('calculates "Mittel" for mid average (between 1.7 and 2.3 inclusive)', () => {
        // [Mittel, Mittel] avg = 2.0 → "Mittel"
        render(<TagCalculatedDifficulty tasks={[t('Mittel'), t('Mittel')]} />);
        const tag = screen.getByText('Mittel');


        expect(tag).toBeInTheDocument();
        expect(tag.className).toContain('bg-yellow-100');
        expect(tag.className).toContain('text-yellow-800');
    });

    test('calculates "Schwer" for high average (> 2.3)', () => {
        // [Mittel, Schwer, Schwer] avg = 2.67 → "Schwer"
        render(<TagCalculatedDifficulty tasks={[t('Mittel'), t('Schwer'), t('Schwer')]} />);
        const tag = screen.getByText('Schwer');
        expect(tag).toBeInTheDocument();
        expect(tag.className).toContain('bg-red-100');
        expect(tag.className).toContain('text-red-800');
    });
});
