import React from "react";
import { act, render, screen } from "@testing-library/react";
import PaymentMethodsPanel from "../../../src/components/billing/PaymentMethodsPanel";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { server } from "../../testServer";
import { http, HttpResponse } from "msw";

const API_PAYMENT = `http://127.0.0.1:8000/api/payments/stripe`;

vi.mock("../../../src/components/payments/SaveCardForm", () => {
  return {
    default: () => <div data-testid="mocked-form">Mocked SaveCardForm</div>,
  };
});

describe("PaymentMethodsPanel", () => {
  it("show add card panel if no payment option configured", async () => {
    server.use(
      http.get(`${API_PAYMENT}/payment-methods/`, () => {
        return HttpResponse.json(
          {
            payment_methods: [],
          },
          {
            headers: {
              "Cache-Control": "no-store", // wie vom DSP-Backend
            },
            status: 200,
          },
        );
      }),
    );
    render(<PaymentMethodsPanel />);

    const putCardHereText = await screen.findByText(
      "Hinterlege hier deine Karte.",
      { exact: false },
    );
    expect(putCardHereText).toBeInTheDocument();

    const mockedSaveCardForm = await screen.findByText("Mocked SaveCardForm");
    expect(mockedSaveCardForm).toBeInTheDocument();

    const addNewCardButton = screen.queryByRole("button", {
      name: "Neue Karte hinzufügen",
    });
    expect(addNewCardButton).not.toBeInTheDocument();
  });

  it("don't show add card panel if payment option already configured", async () => {
    server.use(
      http.get(`${API_PAYMENT}/payment-methods/`, () => {
        return HttpResponse.json(
          {
            payment_methods: [
              {
                id: "pm_1ABCDEF",
                brand: "visa",
                last4: "4242",
                exp_month: 12,
                exp_year: new Date().getFullYear() + 1, // immer in der Zukunft
                is_default: true,
              },
            ],
          },
          {
            headers: {
              "Cache-Control": "no-store", // wie vom DSP-Backend
            },
            status: 200,
          },
        );
      }),
    );
    render(<PaymentMethodsPanel />);

    const savedCards = await screen.findByText(/Gespeicherte Karten/i);
    expect(savedCards).toBeInTheDocument();

    const addNewCardButton = screen.getByRole("button", {
      name: "Neue Karte hinzufügen",
    });
    expect(addNewCardButton).toBeInTheDocument();

    const mockedSaveCardForm = screen.queryByText("Mocked SaveCardForm");
    expect(mockedSaveCardForm).not.toBeInTheDocument();
  });

  it("default payment method is always first in the list", async () => {
    server.use(
      http.get(`${API_PAYMENT}/payment-methods/`, () => {
        return HttpResponse.json(
          {
            payment_methods: [
              {
                id: "pm_2SECOND",
                brand: "mastercard",
                last4: "5555",
                exp_month: 11,
                exp_year: new Date().getFullYear() + 1,
                is_default: false,
              },
              {
                id: "pm_1DEFAULT",
                brand: "visa",
                last4: "4242",
                exp_month: 12,
                exp_year: new Date().getFullYear() + 1,
                is_default: true,
              },
            ],
          },
          {
            headers: {
              "Cache-Control": "no-store", // wie vom DSP-Backend
            },
            status: 200,
          },
        );
      }),
    );
    render(<PaymentMethodsPanel />);

    const savedCards = await screen.findByText(/Gespeicherte Karten/i);
    expect(savedCards).toBeInTheDocument();

    const cards = screen.getAllByRole("listitem");
    expect(cards[0]).toHaveTextContent("4242");
    expect(cards[0]).toHaveTextContent("Standard");
    expect(cards[1]).toHaveTextContent("5555");
    expect(cards[1]).not.toHaveTextContent("Standard");

    const mockedSaveCardForm = screen.queryByText("Mocked SaveCardForm");
    expect(mockedSaveCardForm).not.toBeInTheDocument();
  });

  it("button text of 'add card' changes with click", async () => {
    server.use(
      http.get(`${API_PAYMENT}/payment-methods/`, () => {
        return HttpResponse.json(
          {
            payment_methods: [
              {
                id: "pm_1DEFAULT",
                brand: "visa",
                last4: "4242",
                exp_month: 12,
                exp_year: new Date().getFullYear() + 1,
                is_default: true,
              },
            ],
          },
          {
            headers: {
              "Cache-Control": "no-store", // wie vom DSP-Backend
            },
            status: 200,
          },
        );
      }),
    );
    render(<PaymentMethodsPanel />);

    // Karte hinterlegt:
    //      -> Button zeigt "Neue Karte hinzufügen"
    //      -> Kreditkarten-Eingabemaske unsichtbar

    const addNewCardButton = await screen.findByRole("button", {
      name: "Neue Karte hinzufügen",
    });
    expect(addNewCardButton).toBeInTheDocument();

    let mockedSaveCardForm = screen.queryByText("Mocked SaveCardForm");
    expect(mockedSaveCardForm).not.toBeInTheDocument();

    act(() => {
      addNewCardButton?.click();
    });
    // Klick auf "Neue Karte hinzufügen":
    //      -> Button-Text wird zu "Abbrechen"
    //      -> Kreditkarten-Eingabemaske sichtbar

    expect(addNewCardButton).toHaveTextContent("Abbrechen");
    mockedSaveCardForm = screen.queryByText("Mocked SaveCardForm");
    expect(mockedSaveCardForm).toBeInTheDocument();

    act(() => {
      addNewCardButton?.click();
    });
    // Klick auf "Abbrechen" :
    //      -> Button-Text wird wider zu "Neue Karte hinzufügen"
    //      -> Kreditkarten-Eingabemaske wieder unsichtbar
    expect(addNewCardButton).toHaveTextContent("Neue Karte hinzufügen");
    mockedSaveCardForm = screen.queryByText("Mocked SaveCardForm");
    expect(mockedSaveCardForm).not.toBeInTheDocument();
  });
});
