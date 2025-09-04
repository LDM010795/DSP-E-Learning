/**
 * PaymentsSuccessRoute.tsx
 *
 * This page is shown after the user successfully returns from Stripe’s checkout/setup flow.
 *
 * Main responsibilities:
 * - Fetch the Stripe publishable key from the backend (`getStripeConfig`).
 * - Initialize the Stripe.js client using the publishable key.
 * - Wrap the `PaymentsReturn` component inside Stripe Elements so that it can
 *   process and finalize the SetupIntent/payment method.
 *
 * External dependencies:
 * - Stripe.js (@stripe/react-stripe-js)
 * - Backend billing API (`getStripeConfig`)
 * - Local helper (`getStripe`) for initializing the Stripe client.
 * - `PaymentsReturn` component, which handles the actual SetupIntent confirmation.
 *
 * Author: DSP Development Team
 * Date: 2025-09-01
 */

import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { getStripe } from "../../util/payments/stripe";
import { getStripeConfig } from "../../util/apis/billingApi";
import PaymentsReturn from "./PaymentsReturn";

export default function PaymentsSuccessRoute() {
  // Holds the Stripe publishable key once fetched
  const [publishableKey, setKey] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Fetch Stripe publishable key from backend
        const { publishableKey } = await getStripeConfig();
        if (mounted) setKey(publishableKey);
      } catch {
        // If fetch fails, setKey(null) (indicating error state)
        if (mounted) setKey(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Show loading message while publishable key is being fetched
  if (!publishableKey) {
    return <div className="p-6 text-gray-700">Lade Stripe…</div>;
  }

  // Once publishable key is ready, initialize Stripe Elements and render PaymentsReturn
  return (
    <Elements stripe={getStripe(publishableKey)}>
      <PaymentsReturn />
    </Elements>
  );
}
