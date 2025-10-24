import HeaderNavigation from "@/components/layouts/header";
import { renderWithAppProviders } from "../../test-utils";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { server } from "../../testServer.ts";
import { MemoryRouter } from "react-router-dom";

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));

describe("HeaderNavigation", () => {
  it("shows logo with link to  /dashboard", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <HeaderNavigation
          logo={<img src="logo.png" alt="Logo" className="h-12" />}
          links={[]}
        />
      </MemoryRouter>,
    );

    const container = screen.getByTestId("logo-container");
    const link = within(container).getByRole("link", {
      name: /zum dashboard/i,
    });
    expect(link).toHaveAttribute("href", "/dashboard");
    expect(within(link).getByRole("img", { name: "Logo" })).toBeInTheDocument();
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

  it("renders a mobile burger button with responsive classes and in the right container", () => {
    renderWithAppProviders(
      <HeaderNavigation links={[{ title: "Dashboard", to: "/dashboard" }]} />,
    );

    const burger = screen.getByLabelText(/toggle navigation/i);
    expect(burger).toBeInTheDocument();

    // burger is hidden on md+ (mobile-only)
    expect(burger.className).toMatch(/md:hidden/);

    // parent container aligns to right via ml-auto
    const parent = burger.parentElement as HTMLElement | null;
    expect(parent?.className).toMatch(/ml-auto/);
  });

  it("active mobile menu item keeps white text on hover (no parent hover override)", async () => {
    // Make /dashboard the active route so the link is in 'active' state
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <HeaderNavigation links={[{ title: "Dashboard", to: "/dashboard" }]} />
      </MemoryRouter>,
    );

    // open menu (userEvent wraps in act)
    await userEvent.click(screen.getByLabelText(/toggle navigation/i));

    // find the active link inside the mobile menu
    const mobileMenu = screen.getByTestId("mobile-menu");
    const activeLink = within(mobileMenu).getByRole("link", {
      name: /dashboard/i,
    }) as HTMLAnchorElement;

    // Ensure it is marked as active and does NOT have hover text color class
    expect(activeLink.getAttribute("aria-current")).toBe("page");
    expect(activeLink.className).not.toMatch(/hover:text-[\w-]+/);
  });

  it("nav link labels use truncation classes to avoid wrapping", () => {
    renderWithAppProviders(
      <HeaderNavigation
        links={[
          {
            title: "Ein sehr sehr langer Navigationspunkt der truncaten sollte",
            to: "/x",
          },
        ]}
      />,
    );

    const link = screen.getByRole("link", {
      name: /ein sehr sehr langer navigationspunkt/i,
    });

    // In LinkSidebar the visible text sits in an inner <span> with 'truncate'
    const truncatingSpan = link.querySelector("span.truncate");
    expect(truncatingSpan).toBeTruthy();
    expect(truncatingSpan?.className).toMatch(/whitespace-nowrap/);
  });
});
