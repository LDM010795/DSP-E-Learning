/**
 * This file is executed automatically before running any Vitest tests.
 * It provides the global test setup for our frontend project.
 *
 * Responsibilities:
 * - Extend jest-dom matchers (e.g. `toBeInTheDocument`, `toBeVisible`)
 * - Add a fetch polyfill (whatwg-fetch) so API calls work in JSDOM
 * - Start, reset, and stop the MSW (Mock Service Worker) server
 *   → ensures our tests run against mocked Django REST API endpoints
 * - Define browser "shims" for JSDOM (ResizeObserver, IntersectionObserver, scrollTo)
 *   → prevents crashes when components rely on these APIs
 * - Mock HTMLMediaElement methods (play, pause)
 *   → avoids errors when testing video/audio components
 *
 * In short: this file creates a safe and realistic browser-like environment
 * for our tests without requiring a real backend or browser.
 *
 * Author: DSP development Team
 * Date: 2025-09-22
 */


import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Import the MSW server
import { server } from './testServer';

// Setup MSW server lifecycle hooks (start server. reset handler, stop server)
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// JSDOM does not implement ResizeObserver → provide a simple mock
class ResizeObserverMock {
    observe(){}
    unobserve(){}
    disconnect(){}
}

// JSDOM does not implement IntersectionObserver → provide a simple mock
class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return [] }
}

// Attach mocks to global environment so components using them won’t crash
(globalThis as unknown as { ResizeObserver: typeof ResizeObserverMock }).ResizeObserver = ResizeObserverMock;
(globalThis as unknown as { IntersectionObserver: typeof IntersectionObserverMock }).IntersectionObserver = IntersectionObserverMock;


// Mock scrollTo since JSDOM doesn’t implement it
window.scrollTo = () => {};

// Mock HTMLMediaElement methods to avoid "not implemented" errors in video/audio tests
Object.defineProperty(window.HTMLMediaElement.prototype, 'play', { value: async () => {} });
Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', { value: () => {} });
