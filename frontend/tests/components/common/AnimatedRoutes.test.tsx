import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { signIn, signOut } from "../../test-utils";

// mocks müssen vor dem AnimatedRoutesImport passieren, damit sie greifen

vi.mock("../../../src/util/performance", () => ({
  preloadCriticalResources: vi.fn().mockResolvedValue([]),
  throttle: vi.fn(),
  useStableCallback: vi.fn(),
  useShallowMemo: vi.fn(),
  useCachedApi: vi.fn(),
}));

// Mocks für komplexe Packages/Seiten, die den Test durch interne Abhängigkeiten behindern
vi.mock("../../../src/pages/landing_page", () => ({
  default: () => <div>Mocked Landing Page</div>,
}));
vi.mock("../../../src/pages/dashboard", () => ({
  default: () => <div>Mocked Dashboard</div>,
}));
vi.mock("../../../src/pages/task_detail", () => ({
  default: () => <div>Mocked Task Detail</div>,
}));
vi.mock("../../../src/pages/admin_panel/index_admin_panel", () => ({
  default: () => <div>Mocked Admin Panel</div>,
}));
vi.mock("../../../src/pages/payments/PaymentsSuccessRoute", () => ({
  default: () => <div>Mocked PaymentsSuccessRoute</div>,
}));
vi.mock("../../../src/pages/payments/PaymentsCancel", () => ({
  default: () => <div>Mocked PaymentsCancel</div>,
}));
vi.mock("../../../src/pages/payments/Success", () => ({
  default: () => <div>Mocked PaymentsSuccess</div>,
}));
vi.mock("../../../src/pages/payments/PaymentsReturn", () => ({
  default: () => <div>Mocked PaymentsReturn</div>,
}));
vi.mock("../../../src/pages/modules", () => ({
  default: () => <div>Mocked Modules</div>,
}));
vi.mock("../../../src/pages/article", () => ({
  default: () => <div>Mocked Articles</div>,
}));
vi.mock("../../../src/pages/chapter_detail", () => ({
  default: () => <div>Mocked Chapter Detail</div>,
}));
vi.mock("../../../src/pages/task_detail", () => ({
  default: () => <div>Mocked Task Detail</div>,
}));
vi.mock("../../../src/pages/subscriptions", () => ({
  default: () => <div>Mocked Subscriptions</div>,
}));
vi.mock("../../../src/pages/final_exam/index_final_exam", () => ({
  default: () => <div>Mocked Final Exam</div>,
}));
vi.mock("../../../src/pages/certification_paths", () => ({
  default: () => <div>Mocked Certification Paths</div>,
}));

import AnimatedRoutes from "../../../src/components/common/AnimatedRoutes";

function renderRoute(route: string, isAdmin: boolean = false) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AnimatedRoutes isAdmin={isAdmin} />
    </MemoryRouter>,
  );
}

describe("AnimatedRoutes", () => {
  // PublicRoutes

  it("renders LandingPage on root path", async () => {
    renderRoute("/");
    expect(await screen.findByText("Mocked Landing Page")).toBeInTheDocument();
  });

  it("renders Impressum", async () => {
    renderRoute("/Impressum");
    expect(
      await screen.findByRole("heading", { name: "Impressum" }),
    ).toBeInTheDocument();
  });

  it("renders AGB", async () => {
    renderRoute("/AGB");
    expect(
      await screen.findByRole("heading", {
        name: "Allgemeine Geschäftsbedingungen",
      }),
    ).toBeInTheDocument();
  });

  it("renders Datenschutz", async () => {
    renderRoute("/Datenschutz");
    expect(
      await screen.findByRole("heading", {
        name: "Datenschutz" }),
      ).toBeInTheDocument();
  });

  it("renders register", async () => {
    renderRoute("/register");
    expect(
      await screen.findByRole("heading", { name: "Registrieren" }),
    ).toBeInTheDocument();
  });

  it("renders payment success route", async () => {
    renderRoute("/payments/success");
    expect(
      await screen.findByText("Mocked PaymentsSuccessRoute"),
    ).toBeInTheDocument();
  });

  it("renders payment cancel", async () => {
    renderRoute("/payments/cancel");
    expect(
      await screen.findByRole("heading", { name: "Zahlung abgebrochen" }),
    ).toBeInTheDocument();
  });

  it("renders payment checkout success", async () => {
    renderRoute("/payments/checkout/success");
    expect(await screen.findByText("Mocked PaymentsSuccess"));
  });

  it("renders payment return", async () => {
    renderRoute("/payments/return");
    expect(await screen.findByText("Mocked PaymentsReturn"));
  });

  // ProtecedRoutes

  it("does not render force password change when signed out", async () => {
    signOut();
    renderRoute("/force-password-change");
    expect(
      await screen.queryByRole("heading", {
        name: "Passwort ändern erforderlich",
      }),
    ).not.toBeInTheDocument();
  });

  it("renders force password change when signed in", async () => {
    signIn();
    renderRoute("/force-password-change");
    expect(
      await screen.queryByRole("heading", {
        name: "Passwort ändern erforderlich",
      }),
    ).toBeInTheDocument();
  });

  it("does not render content demo when signed out", async () => {
    signOut();
    renderRoute("/content-demo");
    expect(
      await screen.queryByRole("heading", { name: "Content Demo" }),
    ).not.toBeInTheDocument();
  });

  it("renders content demo change when signed in", async () => {
    signIn();
    renderRoute("/content-demo");
    expect(
      await screen.queryByRole("heading", { name: "Content Demo" }),
    ).toBeInTheDocument();
  });

  it("does not render Dashboard when signed out", async () => {
    signOut();
    renderRoute("/dashboard");
    expect(
      await screen.queryByText("Mocked Dashboard"),
    ).not.toBeInTheDocument();
  });

  it("renders Dashboard when signed in", async () => {
    signIn();
    renderRoute("/dashboard");
    expect(await screen.findByText("Mocked Dashboard")).toBeInTheDocument();
  });

  it("does not render Modules when signed out", async () => {
    signOut();
    renderRoute("/modules");
    expect(await screen.queryByText("Mocked Modules")).not.toBeInTheDocument();
  });

  it("renders Modules when signed in", async () => {
    signIn();
    renderRoute("/modules");
    expect(await screen.findByText("Mocked Modules")).toBeInTheDocument();
  });

  it("does not render single Module Page when signed out", async () => {
    signOut();
    renderRoute("/modules/123");
    expect(
      await screen.queryByText("Lade Moduldetails..."),
    ).not.toBeInTheDocument();
  });

  it("renders single Module Page when signed in", async () => {
    signIn();
    renderRoute("/modules/123");
    expect(await screen.findByText("Lade Moduldetails...")).toBeInTheDocument();
  });

  it("does not render Articles when signed out", async () => {
    signOut();
    renderRoute("/modules/123/articles");
    expect(await screen.queryByText("Mocked Articles")).not.toBeInTheDocument();
  });

  it("renders Articles when signed in", async () => {
    signIn();
    renderRoute("/modules/123/articles");
    expect(await screen.findByText("Mocked Articles")).toBeInTheDocument();
  });

  it("does not render Chapter when signed out", async () => {
    signOut();
    renderRoute("/modules/123/chapters/2");
    expect(
      await screen.queryByText("Mocked Chapter Detail"),
    ).not.toBeInTheDocument();
  });

  it("renders Chapter when signed in", async () => {
    signIn();
    renderRoute("/modules/123/chapters/2");
    expect(
      await screen.findByText("Mocked Chapter Detail"),
    ).toBeInTheDocument();
  });

  it("does not render Task when signed out", async () => {
    signOut();
    renderRoute("/modules/123/tasks/2");
    expect(
      await screen.queryByText("Mocked Task Detail"),
    ).not.toBeInTheDocument();
  });

  it("renders Task when signed in", async () => {
    signIn();
    renderRoute("/modules/123/tasks/2");
    expect(await screen.findByText("Mocked Task Detail")).toBeInTheDocument();
  });

  it("does not render Subscription when signed out", async () => {
    signOut();
    renderRoute("/subscriptions");
    expect(
      await screen.queryByText("Mocked Subscriptions"),
    ).not.toBeInTheDocument();
  });

  it("renders Subscription when signed in", async () => {
    signIn();
    renderRoute("/subscriptions");
    expect(await screen.findByText("Mocked Subscriptions")).toBeInTheDocument();
  });

  it("does not render Final Exam when signed out", async () => {
    signOut();
    renderRoute("/final-exam");
    expect(
      await screen.queryByText("Mocked Final Exam"),
    ).not.toBeInTheDocument();
  });

  it("renders Final Exam when signed in", async () => {
    signIn();
    renderRoute("/final-exam");
    expect(await screen.findByText("Mocked Final Exam")).toBeInTheDocument();
  });

  it("does not render Certification Paths when signed out", async () => {
    signOut();
    renderRoute("/certification-paths");
    expect(
      await screen.queryByText("Mocked Certification Paths"),
    ).not.toBeInTheDocument();
  });

  it("renders Certification Paths when signed in", async () => {
    signIn();
    renderRoute("/certification-paths");
    expect(
      await screen.findByText("Mocked Certification Paths"),
    ).toBeInTheDocument();
  });

  it("does not render User Statistics when signed out", async () => {
    signOut();
    renderRoute("/user-stats");
    expect(
      await screen.queryByRole("heading", { name: "Statistiken" }),
    ).not.toBeInTheDocument();
  });

  it("renders User Statistics when signed in", async () => {
    signIn();
    renderRoute("/user-stats");
    expect(
      await screen.queryByRole("heading", { name: "Statistiken" }),
    ).toBeInTheDocument();
  });

  it("does not render Settings when signed out", async () => {
    signOut();
    renderRoute("/settings");
    expect(
      await screen.queryByRole("heading", { name: "Einstellungen" }),
    ).not.toBeInTheDocument();
  });

  it("renders Settings when signed in", async () => {
    signIn();
    renderRoute("/settings");
    expect(
      await screen.queryByRole("heading", { name: "Einstellungen" }),
    ).toBeInTheDocument();
  });

  it("does not render Admin Panel when signed out", async () => {
    signOut();

    // nicht-Admin
    renderRoute("/admin");
    expect(screen.queryByText("Mocked Admin Panel")).not.toBeInTheDocument();

    // Admin
    renderRoute("/admin", true);
    expect(screen.queryByText("Mocked Admin Panel")).not.toBeInTheDocument();
  });

  it("does not render Admin Panel when signed in but no admin rights", async () => {
    signIn();
    renderRoute("/admin");
    expect(screen.queryByText("Mocked Admin Panel")).not.toBeInTheDocument();
  });

  it("renders Admin Panel when signed in and admin rights", async () => {
    signIn();
    renderRoute("/admin", true);
    expect(screen.queryByText("Mocked Admin Panel")).toBeInTheDocument();
  });
});
