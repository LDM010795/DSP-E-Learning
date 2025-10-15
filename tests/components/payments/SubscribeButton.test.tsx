import { fireEvent, render, screen } from "@testing-library/react";
import SubscribeButton from "@/components/payments/SubscribeButton";
import * as billingApi from "@/util/apis/billingApi";
import { http } from "msw";
import { server } from "../../testServer";

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  vi.resetModules();
});

afterAll(() => server.close());

describe("SubscribeButton", () => {
  it("renders button text", async () => {
    render(<SubscribeButton courseId="1" priceId="1" label="Jetzt kaufen!" />);

    const buyButton = screen.getByRole("button", { name: "Jetzt kaufen!" });
    expect(buyButton).toBeInTheDocument();
  });

  it("renders loading text on button click", async () => {
    render(<SubscribeButton courseId="1" priceId="1" label="Jetzt kaufen!" />);

    const buyButton = screen.getByRole("button", { name: "Jetzt kaufen!" });
    expect(buyButton).toBeInTheDocument();

    fireEvent.click(buyButton);
    const rerenderedButton = screen.getByRole("button", {
      name: "Weiterleiten…",
    });
    expect(rerenderedButton).toBeInTheDocument();
  });

  it("displays error message on failed API call", async () => {
    vi.spyOn(billingApi, "createCheckoutSession").mockImplementation(
      async () => {
        throw new Error("Some error"); // notwendig, um throttling nicht zu triggern
      },
    );
    const onError = vi.fn();
    server.use(
      http.post("*/api/payments/stripe/checkout-session/", () => {
        return new Response(JSON.stringify({ error: "Some error" }), {
          status: 500,
        });
      }),
    );

    render(
      <SubscribeButton
        courseId="1"
        priceId="1"
        label="Jetzt kaufen!"
        onError={onError}
      />,
    );

    const button = screen.getByRole("button", { name: "Jetzt kaufen!" });
    fireEvent.click(button);

    // warten bis Loading vorbei ist und Fehler angezeigt wird
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Konnte Checkout-Session nicht erstellen.");
    expect(onError).toHaveBeenCalledWith(
      "Konnte Checkout-Session nicht erstellen.",
    );
  });
});
