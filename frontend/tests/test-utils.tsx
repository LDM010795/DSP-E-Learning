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
import { AuthProvider } from "DSP-E-Learning/frontend/src/context/AuthContext";
import { ModuleProvider } from "DSP-E-Learning/frontend/src/context/ModuleContext";
import { ExamProvider } from "DSP-E-Learning/frontend/src/context/ExamContext";

type UI = Parameters<typeof render>[0];

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
