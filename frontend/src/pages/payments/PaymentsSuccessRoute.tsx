// src/pages/payments/PaymentsSuccessRoute.tsx
import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { getStripe } from "../../util/payments/stripe";
import { getStripeConfig } from "../../util/apis/billingApi";
import PaymentsReturn from "./PaymentsReturn";

export default function PaymentsSuccessRoute() {
  const [publishableKey, setKey] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { publishableKey } = await getStripeConfig();
        if (mounted) setKey(publishableKey);
      } catch {
        if (mounted) setKey(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (!publishableKey) {
    return <div className="p-6 text-gray-700">Lade Stripe…</div>;
  }

  return (
    <Elements stripe={getStripe(publishableKey)}>
      <PaymentsReturn />
    </Elements>
  );
}
