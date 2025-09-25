import { describe } from "vitest";
import FooterNavigation from "../../../src/components/layouts/footer";
import { screen } from "@testing-library/react";
import { renderWithAppProviders } from "../../test-utils";
import {server} from "../../testServer.ts";

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));

describe("FooterNavigation", () => {
  it("Copyright is displayed", () => {
    renderWithAppProviders(<FooterNavigation />);
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(`© ${currentYear} DataSmart Learning`),
    ).toBeInTheDocument();
  });

  it("Impressum Link is displayed and works", () => {
    renderWithAppProviders(<FooterNavigation />);
    const impressumLink = screen.getByRole("link", { name: "Impressum" });
    expect(impressumLink).toBeInTheDocument();
    expect(impressumLink).toHaveAttribute("href", "/Impressum");
  });

  it("Datenschutz is displayed", () => {
    renderWithAppProviders(<FooterNavigation />);
    const datenschutzLink = screen.getByRole("link", { name: "Datenschutz" });
    expect(datenschutzLink).toBeInTheDocument();
    expect(datenschutzLink).toHaveAttribute("href", "/Datenschutz");
  });

  it("AGBs are displayed", () => {
    renderWithAppProviders(<FooterNavigation />);
    const agbLink = screen.getByRole("link", {
      name: "AGBs und Widerrufsbelehrung",
    });
    expect(agbLink).toBeInTheDocument();
    expect(agbLink).toHaveAttribute("href", "/AGB");
  });
});
