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
import { AuthProvider } from "../src/context/AuthContext"
import { ModuleProvider } from "../src/context/ModuleContext";
import { ExamProvider } from "../src/context/ExamContext";

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
    useAuth: () => mockAuth
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

export function signIn(user = { id: 1, name: "Test User" }) {
  mockAuth.user = user;
  mockAuth.isAuthenticated = true;
}

export function signOut() {
  mockAuth.user = null;
  mockAuth.isAuthenticated = false;
}
