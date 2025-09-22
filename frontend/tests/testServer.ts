/**
 * Creates a centralized MSW (Mock Service Worker) server instance for tests.
 *
 * - Imports all request handlers from testHandlers.ts
 * - Spreads them into setupServer(...) to register mock API endpoints
 * - Exported "server" is started/stopped in setupTests.ts lifecycle hooks
 *
 * Purpose:
 * Ensures that all frontend tests run against a controlled, mocked
 * version of the Django REST API instead of making real network calls.
 *
 * Author: DSP development Team
 * Date: 2025-09-22
 */

import { setupServer } from 'msw/node';
import { handlers } from './testHandlers.ts';

export const server = setupServer(...handlers);
