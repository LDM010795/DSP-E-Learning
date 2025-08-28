/**
 * SaveCardForm (Stripe SetupIntent)
 * =================================
 *
 * Purpose
 * -------
 * Collect a user's card (via Stripe Elements) and save it to their Stripe Customer
 * using a server-created SetupIntent. No charge happens here — it's just saving
 * a payment method for later use (e.g., subscriptions or one-off purchases).
 *
 * Flow (happy path)
 * -----------------
 * 1) Fetch publishable key      → GET /payments/stripe/config/
 * 2) Create SetupIntent         → POST /payments/stripe/setup-intent/
 * 3) Render <Elements> + card form (PaymentElement)
 * 4) On submit: confirmSetup(...) with client_secret
 * 5) On success: call onSuccess() (parent can navigate / refresh PM list)
 *
 * Performance & UX
 * ----------------
 * - Warm loads Stripe SDK via `warmStripe(publishableKey)` to reduce latency.
 * - Uses AbortController to cancel API calls on unmount (no setState leaks).
 * - Disables UI during submission; prevents double submit.
 * - Collapses internal state updates to minimize re-renders.
 *
 * Author: DSP Development Team
 * Date: 2025-08-26
 */

import React from "react";
import {
  Elements,
  useElements,
  useStripe,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { getStripe, warmStripe } from "../../util/payments/stripe";
import { createSetupIntent, getStripeConfig } from "../../util/apis/billingApi";

type SaveCardFormProps = {
  onSuccess?: () => void;
  onSkip?: () => void;
  title?: string;
  className?: string;
  showSkip?: boolean;
  buttonLabel?: string;
};

// State machine for loading Stripe config + client_secret
type LoaderState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; publishableKey: string; clientSecret: string }
  | { kind: "error"; message: string };

export default function SaveCardForm({
  onSuccess,
  onSkip,
  title = "Zahlungsmethode hinzufügen",
  className,
  showSkip = true,
  buttonLabel = "Zahlungsmethode speichern",
}: SaveCardFormProps) {
  const [state, setState] = React.useState<LoaderState>({ kind: "idle" });

  // AbortController allows cancelling API calls if component unmounts
  const abortRef = React.useRef<AbortController | null>(null);

  // Bootstrap effect: fetch publishable key + create SetupIntent
  React.useEffect(() => {
    let cancelled = false;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    (async () => {
      try {
        setState({ kind: "loading" });

        // 1. Get publishable key for Stripe.js
        // 2. Create SetupIntent (returns client_secret)
        const [{ publishableKey }, { client_secret }] = await Promise.all([
          getStripeConfig(),
          createSetupIntent(),
        ]);

        if (!client_secret)
          throw new Error("Fehlender client_secret vom Backend.");

        // Performance: warm load Stripe SDK early
        warmStripe(publishableKey);

        if (!cancelled) {
          setState({
            kind: "ready",
            publishableKey,
            clientSecret: client_secret,
          });
        }
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error
            ? err.message
            : "Konnte Stripe-Konfiguration nicht laden.";
        setState({ kind: "error", message });
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, []);

  // Always compute a stable key so hooks stay at the top level.
  // If we’re not ready yet, publishableKey is undefined.
  const publishableKey =
    state.kind === "ready" ? state.publishableKey : undefined;

  // Memoize the Stripe Promise per key. If there is no key yet,
  // resolve to null to keep a consistent return type and hook order.
  const stripePromise = React.useMemo(
    () => (publishableKey ? getStripe(publishableKey) : Promise.resolve(null)),
    [publishableKey],
  );

  // Render different states
  if (state.kind === "idle" || state.kind === "loading") {
    return (
      <div
        className={
          className ?? "w-full max-w-lg bg-white rounded-2xl p-6 shadow"
        }
      >
        <h2 className="text-lg font-semibold mb-3">{title}</h2>
        <p className="text-gray-600">Lade Zahlungsformular…</p>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div
        className={
          className ?? "w-full max-w-lg bg-white rounded-2xl p-6 shadow"
        }
      >
        <h2 className="text-lg font-semibold mb-3">{title}</h2>
        <div className="text-red-600">{state.message}</div>
        {showSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="mt-4 px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50"
          >
            Überspringen
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={className ?? "w-full max-w-lg bg-white rounded-2xl p-6 shadow"}
    >
      <h2 className="text-lg font-semibold mb-4">{title}</h2>

      {/* Provide Stripe context to children */}
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret: state.clientSecret,
          appearance: {
            theme: "stripe",
            variables: { colorPrimary: "#f97316" }, // optional branding (orange)
          },
        }}
      >
        <InnerSaveCardForm
          onSuccess={onSuccess}
          onSkip={showSkip ? onSkip : undefined}
          buttonLabel={buttonLabel}
        />
      </Elements>
    </div>
  );
}

/**
 * Inner form
 * ----------
 * This part is rendered *inside* <Elements>. It shows the card input (PaymentElement),
 * handles submission, and reports success/error back to parent via callbacks.
 */
function InnerSaveCardForm({
  onSuccess,
  onSkip,
  buttonLabel,
}: {
  onSuccess?: () => void;
  onSkip?: () => void;
  buttonLabel: string;
}) {
  const stripe = useStripe(); // hook to access Stripe instance
  const elements = useElements(); // hook to access mounted PaymentElement
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || submitting) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      // Confirm the SetupIntent (attach card to customer)
      const { error } = await stripe.confirmSetup({
        elements,
        redirect: "if_required", // avoid full redirect when possible
        confirmParams: {
          return_url: window.location.origin + "/payments/success", // fallback if Stripe forces redirect
        },
      });

      if (error) {
        setErrorMsg(
          error.message ?? "Die Zahlungsbestätigung ist fehlgeschlagen.",
        );
        return;
      }

      // Success → card attached to user
      onSuccess?.();
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Unbekannter Fehler bei der Zahlungsbestätigung.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Stripe PaymentElement = all-in-one card field (handles brand, expiry, CVC, etc.) */}
      <div className="rounded-xl border border-gray-200 p-3 bg-white">
        <PaymentElement id="payment-element" />
      </div>

      {/* Error display (if any) */}
      {errorMsg && (
        <div className="text-sm text-red-600" role="alert">
          {errorMsg}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!stripe || !elements || submitting}
          className="px-4 py-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-60"
        >
          {submitting ? "Speichere…" : buttonLabel}
        </button>

        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            disabled={submitting}
            className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50"
          >
            Später
          </button>
        )}
      </div>
    </form>
  );
}
