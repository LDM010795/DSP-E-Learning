/**
 * useScrollAnimation tests
 *
 * Verifies:
 * - Initially returns isVisible = false
 * - Calls IntersectionObserver with provided options
 * - Sets isVisible = true when entry is intersecting
 * - With triggerOnce (default) → unobserve is called after first intersection
 * - With triggerOnce = false → stays observed (no unobserve) and still becomes visible
 * - Cleans up by calling disconnect on unmount
 *
 * Author : DSP-Development Team
 * Date: 2025-01-01
 */

import React from 'react';
import { render, screen, cleanup, act, waitFor } from '@testing-library/react';
import useScrollAnimation from '../../src/hooks/useScrollAnimation';

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

// ---- mock IntersectionObserver ----
class MockIntersectionObserver {
    cb: IntersectionObserverCallback;
    options: IntersectionObserverInit;
    elements: Set<Element>;
    observe = vi.fn((el: Element) => this.elements.add(el));
    unobserve = vi.fn((el: Element) => this.elements.delete(el));
    disconnect = vi.fn(() => this.elements.clear());

    constructor(cb: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        this.cb = cb;
        this.options = options || {};
        this.elements = new Set();
        instances.push(this);
    }

    // helper to simulate intersection
    trigger(el: Element, isIntersecting: boolean) {
        const entry = {
            isIntersecting,
            target: el,
            intersectionRatio: isIntersecting ? 1 : 0,
        } as IntersectionObserverEntry;
        this.cb([entry], this as unknown as IntersectionObserver);
    }
}

let instances: MockIntersectionObserver[] = [];

beforeAll(() => {
    (global as any).IntersectionObserver = MockIntersectionObserver;
});

beforeEach(() => {
    instances = [];
});

// ---- test component that uses the hook ----
const TestComponent: React.FC<{ options?: any }> = ({ options }) => {
    const [ref, isVisible] = useScrollAnimation<HTMLDivElement>(options);
    return (
        <div>
            <div ref={ref} data-testid="box">box</div>
            <div data-testid="visible">{String(isVisible)}</div>
        </div>
    );
};

describe('useScrollAnimation', () => {
    it('returns isVisible=false initially and observes the element', () => {
        render(<TestComponent />);
        const box = screen.getByTestId('box');
        expect(screen.getByTestId('visible').textContent).toBe('false');
        expect(instances.length).toBe(1);
        expect(instances[0].observe).toHaveBeenCalledWith(box);
    });

    it('sets isVisible=true on first intersection and unobserves when triggerOnce=true (default)', async () => {
        render(<TestComponent />);
        const box = screen.getByTestId('box');
        const io = instances[0];

        // simulate intersection inside act
        act(() => {
            io.trigger(box, true);
        });

        await waitFor(() =>
            expect(screen.getByTestId('visible').textContent).toBe('true')
        );

        // should unobserve because triggerOnce = true
        expect(io.unobserve).toHaveBeenCalledWith(box);
    });

    it('does not unobserve when triggerOnce=false', async () => {
        render(<TestComponent options={{ threshold: 0, triggerOnce: false }} />);
        const box = screen.getByTestId('box');
        const io = instances[0];

        expect(io.observe).toHaveBeenCalledWith(box);
        // simulate intersection
        act(() => {
            io.trigger(box, true);
        });

        await waitFor(() =>
            expect(screen.getByTestId('visible').textContent).toBe('true')
        );

        // should still be observing
        expect(io.unobserve).not.toHaveBeenCalled();
    });

    it('disconnects the observer on unmount (cleanup)', () => {
        const { unmount } = render(<TestComponent />);
        const io = instances[0];
        unmount();
        expect(io.disconnect).toHaveBeenCalled();
    });
});
