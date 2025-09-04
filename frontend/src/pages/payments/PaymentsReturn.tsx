/**
 * PaymentsReturn.tsx
 *
 * This component handles the frontend logic after a user is redirected back
 * from Stripe’s SetupIntent flow (e.g., when adding or verifying a payment method).
 *
 * Main responsibilities:
 * - Retrieve the `setup_intent_client_secret` from the URL query parameters.
 * - Use Stripe.js to confirm and fetch the SetupIntent status.
 * - If successful, set the retrieved payment method as the default by calling the backend API.
 * - Show success/failure messages to the user and redirect to the dashboard on success.
 *
 * External dependencies:
 * - Stripe.js (@stripe/stripe-js, @stripe/react-stripe-js)
 * - Backend billing API (`getStripeConfig`, `setDefaultPaymentMethod`)
 *
 * Flow:
 * 1. The outer `PaymentsReturn` component loads the Stripe publishable key from the backend.
 * 2. Once the key is available, it initializes Stripe Elements.
 * 3. The inner component (`PaymentsReturnInner`) uses Stripe.js to handle SetupIntent retrieval
 *    and updates the UI state accordingly.
 *
 * Author: DSP Development Team
 * Date: 2025-08-26
 */

import { useEffect, useMemo, useState } from "react";
import { Elements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import {
  getStripeConfig,
  setDefaultPaymentMethod,
} from "../../util/apis/billingApi";

function PaymentsReturnInner() {
  const stripe = useStripe(); // Access the initialized Stripe object
  const [msg, setMsg] = useState("Finalisiere Zahlung…");

  useEffect(() => {
    if (!stripe) return;

    // Extract the SetupIntent client secret from the URL
    const sp = new URLSearchParams(window.location.search);
    const siClientSecret = sp.get("setup_intent_client_secret");
    if (!siClientSecret) {
      setMsg("Kein SetupIntent gefunden.");
      return;
    }

    (async () => {
      // Ask Stripe to retrieve the SetupIntent
      const { setupIntent, error } =
        await stripe.retrieveSetupIntent(siClientSecret);
      if (error || !setupIntent) {
        setMsg("Konnte SetupIntent nicht abrufen.");
        return;
      }
      // If SetupIntent was successful and has a valid payment method
      if (
        setupIntent.status === "succeeded" &&
        typeof setupIntent.payment_method === "string"
      ) {
        try {
          // Call backend API to mark this payment method as default
          await setDefaultPaymentMethod(setupIntent.payment_method);
        } catch {
          // non-fatal; webhook/other sync may also handle it
        }
        setMsg("Zahlungsmethode gespeichert. Weiterleitung…");
        window.location.replace("/dashboard");
      } else {
        setMsg("Authentifizierung nicht abgeschlossen.");
      }
    })();
  }, [stripe]);

  return <div className="p-6 text-gray-700">{msg}</div>;
}

export default function PaymentsReturn() {
  const [pk, setPk] = useState<string | null>(null); // Stripe publishable key
  const [err, setErr] = useState<string | null>(null); // Error state

  useEffect(() => {
    (async () => {
      try {
        // Fetch Stripe configuration from backend (publishable key)
        const { publishableKey } = await getStripeConfig();
        setPk(publishableKey);
      } catch (e) {
        setErr("Stripe-Konfiguration konnte nicht geladen werden.");
      }
    })();
  }, []);

  // Memoize the Stripe promise – loadStripe initializes Stripe.js
  const stripePromise = useMemo<Promise<Stripe | null>>(
    () => (pk ? loadStripe(pk) : Promise.resolve(null)),
    [pk],
  );

  // Handle error or loading states
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!pk) return <div className="p-6 text-gray-700">Lade…</div>;

  // Render Stripe Elements provider with the loaded Stripe instance
  return (
    <Elements
      stripe={stripePromise}
      options={{ appearance: { theme: "stripe" } }}
    >
      <PaymentsReturnInner />
    </Elements>
  );
}
