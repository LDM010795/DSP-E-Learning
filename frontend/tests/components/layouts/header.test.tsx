import HeaderNavigation from "@/components/layouts/header";
import { renderWithAppProviders } from "../../test-utils";
import { fireEvent, render, screen, within } from "@testing-library/react";
import {server} from "../../testServer.ts";

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));

describe("HeaderNavigation", () => {
  it("shows logo", () => {
    const testLogo = "test-logo.png";
    render(
      <HeaderNavigation
        logo={<img src={testLogo} alt="Logo" className="h-12" />}
        links={[]}
      />,
    );
    const logo = screen.getByRole("img", { name: "Logo" });
    expect(logo).toBeInTheDocument();
  });

  it("shows nav items", () => {
    renderWithAppProviders(
      <HeaderNavigation
        links={[
          { title: "Dashboard", to: "/dashboard" },
          { title: "Module & Lerninhalte", to: "/modules" },
          { title: "Abonnements", to: "/subscriptions" },
        ]}
        rightContent={[{ title: "Einstellungen", to: "/settings" }]}
      />,
    );
    const dashboard = screen.getByRole("link", { name: "Dashboard" });
    expect(dashboard).toBeInTheDocument();
    expect(dashboard).toHaveAttribute("href", "/dashboard");

    const modulesAndLearningContent = screen.getByRole("link", {
      name: "Module & Lerninhalte",
    });
    expect(modulesAndLearningContent).toBeInTheDocument();
    expect(modulesAndLearningContent).toHaveAttribute("href", "/modules");

    const subscriptions = screen.getByRole("link", { name: "Abonnements" });
    expect(subscriptions).toBeInTheDocument();
    expect(subscriptions).toHaveAttribute("href", "/subscriptions");

    const settings = screen.getByRole("link", { name: "Einstellungen" });
    expect(settings).toBeInTheDocument();
    expect(settings).toHaveAttribute("href", "/settings");
  });

  it("toggles mobile menu", () => {
    renderWithAppProviders(
      <HeaderNavigation links={[{ title: "Dashboard", to: "/dashboard" }]} />,
    );

    const toggleButton = screen.getByLabelText("Toggle Navigation");

    // Mobile Menu sollte anfangs nicht gerendert sein
    expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();

    // Klick → Menu öffnen
    fireEvent.click(toggleButton);

    const mobileMenu = screen.getByTestId("mobile-menu");
    expect(mobileMenu).toBeInTheDocument();
    expect(within(mobileMenu).getByText("Dashboard")).toBeInTheDocument();

    // Klick → Menu schließen
    fireEvent.click(toggleButton);
    expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();
  });

  it("does not show protected links when not authenticated", () => {
    renderWithAppProviders(
      <HeaderNavigation
        links={[{ title: "Settings", to: "/settings", requiresAuth: true }]}
        isAuthenticated={false}
      />,
    );

    expect(screen.queryByText("Settings")).not.toBeInTheDocument();
  });

  it("shows protected links when authenticated", () => {
    renderWithAppProviders(
      <HeaderNavigation
        links={[{ title: "Settings", to: "/settings", requiresAuth: true }]}
        isAuthenticated={true}
      />,
    );

    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("automatically adds /subscriptions link if not present", () => {
    renderWithAppProviders(
      <HeaderNavigation
        links={[{ title: "Dashboard", to: "/dashboard" }]}
        isAuthenticated={true}
      />,
    );

    expect(
      screen.getByRole("link", { name: "Abonnements" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abonnements" })).toHaveAttribute(
      "href",
      "/subscriptions",
    );
  });

  it("does not add /subscriptions link if not present and not authenticated", () => {
    renderWithAppProviders(
      <HeaderNavigation
        links={[{ title: "Dashboard", to: "/dashboard" }]}
        isAuthenticated={false}
      />,
    );

    expect(
      screen.queryByRole("link", { name: "Abonnements" }),
    ).not.toBeInTheDocument();
  });

  it("does not duplicate /subscriptions link if already present", () => {
    renderWithAppProviders(
      <HeaderNavigation
        links={[
          { title: "Dashboard", to: "/dashboard" },
          { title: "Abonnements", to: "/subscriptions" }, // schon vorhanden
        ]}
      />,
    );
    const subscriptionLinks = screen.getAllByRole("link", {
      name: "Abonnements",
    });
    expect(subscriptionLinks).toHaveLength(1);
    expect(subscriptionLinks[0]).toHaveAttribute("href", "/subscriptions");
  });
});
