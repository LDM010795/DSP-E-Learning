/**
 * This file configures ONLY the testing environment (not the normal Vite build).
 * It lives in the project root, next to vite.config.ts.
 *
 * Key points:
 * - plugins: enables the React plugin so JSX/TSX works inside tests
 * - test.environment: "jsdom" simulates a browser-like DOM for React component tests
 * - test.setupFiles: points to src/test/setupTests.ts where MSW + jest-dom are initialized
 * - test.globals: allows using global test APIs like `describe`, `it`, `expect` without imports
 * - test.css: allows importing CSS in components during tests
 * - test.restoreMocks: automatically resets mocks between tests
 * - test.coverage:
 *    provider: "v8" (built-in, no extra install required)
 *    reporter: ['text', 'html'] → text summary in console + HTML report in folder
 *    reportsDirectory: location where coverage reports will be saved
 *
 * Author: DSP development Team
 * Date: 2025-09-22
 */

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom", // Browser-ähnliche Umgebung
    setupFiles: "./src/test/setupTests.ts",
    globals: true,
    css: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "coverage/unit",
    },
  },
  resolve: {
    alias: {
      "@": "/src",
      "@components": "/src/components",
      "@pages": "/src/pages",
      "@context": "/src/context",
      "@apis": "/src/util/apis",
      "@utils": "/src/util",
    },
  },
});
