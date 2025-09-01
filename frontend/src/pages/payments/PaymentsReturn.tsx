import { useEffect, useMemo, useState } from "react";
import { Elements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { getStripeConfig, setDefaultPaymentMethod } from "../../util/apis/billingApi";

function PaymentsReturnInner() {
  const stripe = useStripe();
  const [msg, setMsg] = useState("Finalisiere Zahlung…");

  useEffect(() => {
    if (!stripe) return;

    const sp = new URLSearchParams(window.location.search);
    const siClientSecret = sp.get("setup_intent_client_secret");
    if (!siClientSecret) {
      setMsg("Kein SetupIntent gefunden.");
      return;
    }

    (async () => {
      const { setupIntent, error } = await stripe.retrieveSetupIntent(siClientSecret);
      if (error || !setupIntent) {
        setMsg("Konnte SetupIntent nicht abrufen.");
        return;
      }
      if (setupIntent.status === "succeeded" && typeof setupIntent.payment_method === "string") {
        try {
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
  const [pk, setPk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { publishableKey } = await getStripeConfig();
        setPk(publishableKey);
      } catch (e) {
        setErr("Stripe-Konfiguration konnte nicht geladen werden.");
      }
    })();
  }, []);

  const stripePromise = useMemo<Promise<Stripe | null>>(
    () => (pk ? loadStripe(pk) : Promise.resolve(null)),
    [pk]
  );

  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!pk) return <div className="p-6 text-gray-700">Lade…</div>;

  return (
    <Elements stripe={stripePromise} options={{ appearance: { theme: "stripe" } }}>
      <PaymentsReturnInner />
    </Elements>
  );
}
