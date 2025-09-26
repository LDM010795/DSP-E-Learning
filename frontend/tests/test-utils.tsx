/**
 * Custom testing utility for React components in this project.
 *
 * Purpose:
 * - Avoids boilerplate in every test file by providing a `renderWithAppProviders`
 *   function that automatically wraps components with:
 *     - MemoryRouter → simulates routing (with optional initial route)
 *     - AuthProvider → supplies authentication context
 *     - ModuleProvider → supplies module context
 *     - ExamProvider → supplies exam context
 *
 * Notes:
 * - This helper uses RTL’s `render` internally, so all queries (`screen.getByText`, etc.)
 *  work the same way as in plain RTL.
 * - Keeps tests consistent with the actual app setup (router + contexts).
 *
 * Author: DSP development Team
 * Date: 2025-09-22
 */

import type { ReactNode } from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AuthProvider } from "@context/AuthContext.tsx";
import { ModuleProvider } from "@context/ModuleContext.tsx";
import { ExamProvider } from "@context/ExamContext.tsx";

type UI = Parameters<typeof render>[0];

export const mockAuth = {
  user: null as { id: number; name: string } | null,
  isAuthenticated: false,
  login: vi.fn(),
  logout: vi.fn(),
};

vi.mock("../src/context/AuthContext", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useAuth: () => mockAuth,
  };
});

export function renderWithAppProviders(ui: UI, route = "/") {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <ModuleProvider>
          <ExamProvider>{children}</ExamProvider>
        </ModuleProvider>
      </AuthProvider>
    </MemoryRouter>
  );

  return render(ui, { wrapper: Wrapper });
}

export function renderMocksForResponsiveContainer() {
  const originalGetBoundingClientRect =
    HTMLElement.prototype.getBoundingClientRect;

  // Make getBoundingClientRect return non-zero for the recharts wrapper
  HTMLElement.prototype.getBoundingClientRect = function () {
    if (
      this.classList &&
      this.classList.contains("recharts-responsive-container")
    ) {
      return {
        width: 800,
        height: 300,
        top: 0,
        left: 0,
        right: 800,
        bottom: 300,
        x: 0,
        y: 0,
        toJSON: () => {},
      } as DOMRect;
    }
    return (
      originalGetBoundingClientRect?.call(this) ?? {
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        x: 0,
        y: 0,
        toJSON: () => {},
      }
    );
  };

  // offsetWidth/offsetHeight positive values
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get() {
      return 800;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    get() {
      return 300;
    },
  });

  // requestAnimationFrame polyfill to run callbacks
  (global as any).requestAnimationFrame = (cb: FrameRequestCallback) =>
    setTimeout(cb, 0);

  // ResizeObserver mock that immediately notifies with current rect
  class MockResizeObserver {
    cb: any;
    constructor(cb: any) {
      this.cb = cb;
    }
    observe(target: Element) {
      const rect = (target as any).getBoundingClientRect?.() ?? {
        width: 800,
        height: 300,
      };
      this.cb([
        { target, contentRect: { width: rect.width, height: rect.height } },
      ]);
    }
    unobserve() {}
    disconnect() {}
  }
  (global as any).ResizeObserver = MockResizeObserver;
}

export function signIn(user = { id: 1, name: "Test User" }) {
  mockAuth.user = user;
  mockAuth.isAuthenticated = true;
}

export function signOut() {
  mockAuth.user = null;
  mockAuth.isAuthenticated = false;
}
