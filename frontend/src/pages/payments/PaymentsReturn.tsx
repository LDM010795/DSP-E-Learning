
import { useEffect, useState } from "react";
import { useStripe } from "@stripe/react-stripe-js";
import { setDefaultPaymentMethod } from "../../util/apis/billingApi";

export default function PaymentsReturn() {
  const stripe = useStripe();
  const [msg, setMsg] = useState("Finalisiere Zahlung…");

  useEffect(() => {
    if (!stripe) return;

    // Stripe appends ?setup_intent=...&setup_intent_client_secret=... when it redirects back
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
          // ignore: webhook should set it; we don't block UX here
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
