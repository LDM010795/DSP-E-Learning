import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SaveCardForm from "@/components/payments/SaveCardForm";
import { server } from "../../testServer";
import * as billingApi from "@/util/apis/billingApi";


// --- Global FakeStripe ---
const fakeStripe = {
  elements: () => ({}),
  confirmSetup: vi.fn(),
};

// --- One global vi.mock ---
vi.mock("@stripe/react-stripe-js", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    Elements: ({ children }: any) => <>{children}</>,
    useStripe: () => fakeStripe,
    useElements: () => fakeStripe.elements(),
    PaymentElement: () => <div>PaymentElement</div>,
  };
});

// --- Helpers ---
const mockStripeSuccess = () =>
  fakeStripe.confirmSetup.mockResolvedValue({
    setupIntent: { payment_method: "pm_123" },
    error: undefined,
  });

const mockStripeError = (message = "Card declined") =>
  fakeStripe.confirmSetup.mockResolvedValue({ error: { message } });

beforeEach(() => {
  vi.clearAllMocks(); // clears call counts etc.
  fakeStripe.confirmSetup.mockReset();
  server.resetHandlers();
});

describe("SaveCardForm", () => {
  it("renders title and save button", async () => {
    mockStripeSuccess();

    render(
      <SaveCardForm
        title="Meine Zahlungsoption"
        onSuccess={vi.fn()}
        onSkip={vi.fn()}
        showSkip
        buttonLabel="Speichern"
      />,
    );

    expect(screen.getByText("Meine Zahlungsoption")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText("Speichern")).toBeInTheDocument(),
    );
    expect(screen.getByText("PaymentElement")).toBeInTheDocument();
  });

  it("renders skip button on error", async () => {
    vi.spyOn(billingApi, "getStripeConfig").mockRejectedValue(
      new Error("Config fehlgeschlagen"),
    );

    render(
      <SaveCardForm
        title="Meine Zahlungsoption"
        onSuccess={vi.fn()}
        onSkip={vi.fn()}
        showSkip
        buttonLabel="Speichern"
      />,
    );

    await waitFor(() =>
      expect(screen.getByText("Überspringen")).toBeInTheDocument(),
    );
  });

  it("calls onSuccess when confirmSetup succeeds", async () => {
    vi.spyOn(billingApi, "setDefaultPaymentMethod").mockResolvedValue({
      detail: "ok",
    });
    mockStripeSuccess();

    const onSuccess = vi.fn();
    render(
      <SaveCardForm
        title="Meine Zahlungsoption"
        onSuccess={onSuccess}
        showSkip
        buttonLabel="Speichern"
      />,
    );

    fireEvent.click(await screen.findByText("Speichern"));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });

  it("disables submit and shows loading text while submitting", async () => {
    vi.spyOn(billingApi, "setDefaultPaymentMethod").mockResolvedValue({
      detail: "ok",
    });
    mockStripeSuccess();

    render(<SaveCardForm buttonLabel="Speichern" />);
    fireEvent.click(await screen.findByText("Speichern"));

    expect(screen.getByText("Speichere…")).toBeDisabled();
  });

  it("shows error when confirmSetup returns error", async () => {
    mockStripeError("Card declined");

    const onSuccess = vi.fn();
    render(<SaveCardForm onSuccess={onSuccess} buttonLabel="Speichern" />);

    fireEvent.click(await screen.findByText("Speichern"));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Card declined"),
    );
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("calls onSkip when skip button is clicked", async () => {
    mockStripeError();

    const onSkip = vi.fn();
    render(<SaveCardForm onSkip={onSkip} showSkip buttonLabel="Speichern" />);

    fireEvent.click(await screen.findByText("Später"));
    expect(onSkip).toHaveBeenCalled();
  });
});
