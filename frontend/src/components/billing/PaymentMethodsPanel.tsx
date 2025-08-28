/**
 * PaymentMethodsPanel
 * ================================================================
 * ROLE
 * - Allows a logged-in user to view, add, or skip adding a payment method.
 * - Lists all saved cards (from Stripe via backend) and integrates the
 *   SaveCardForm to attach a new one.
 *
 * CONTEXT
 * - After registration, new users are redirected here (Einstellungen > Zahlungen).
 * - Uses backend endpoints:
 *    GET  /api/elearning/payments/stripe/payment-methods/ → list saved cards
 *    POST /api/elearning/payments/stripe/setup-intent/    → SaveCardForm handles
 *
 * USER FLOW
 * 1. Component mounts → fetches saved payment methods.
 * 2. If cards exist → shows list with default card marked.
 * 3. Always renders SaveCardForm → user can add new card or skip.
 * 4. On success or skip → navigates to /dashboard.
 *
 * STATE HANDLING
 * - loading   → show "Lade…"
 * - error     → show error message (but still render SaveCardForm)
 * - items     → array of saved PaymentMethods
 *
 * PERFORMANCE & SAFETY
 * - Uses AbortController to cancel API requests on unmount.
 * - Avoids state updates if component is unmounted (via `cancelled` flag).
 * - Minimal re-renders: state set only when necessary.
 *
 * EXTENSIBILITY
 * - If later you want to support “delete card” or “set default card”,
 *   extend the list rendering with action buttons.
 * - Redirects currently hard-coded to `/dashboard`; can be parameterized.
 *
 * SECURITY
 * - Never handles full card details (only brand, last4, expiry, etc.).
 * - Sensitive information remains in Stripe, we only show metadata.
 *
 * DEPENDENCIES
 * - SaveCardForm (handles Stripe Elements + SetupIntent)
 * - billingApi.listPaymentMethods (Axios → backend)
 */

import * as React from "react";
import SaveCardForm from "../../components/payments/SaveCardForm";
import { listPaymentMethods } from "../../util/apis/billingApi";

// --- Type for payment method items returned by backend ---
type PM = {
  id: string;
  brand?: string;
  last4?: string;
  exp_month?: number;
  exp_year?: number;
  is_default?: boolean;
};

export default function PaymentMethodsPanel() {
  // UI state
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<PM[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);

        // --- API call: fetch saved payment methods from backend ---
        const res = await listPaymentMethods(ac.signal);

        if (!cancelled) {
          // Use safe fallback in case backend returns null/undefined
          setItems(res?.payment_methods ?? []);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          // Error fetching → show error but still render SaveCardForm
          setError("Konnte Zahlungsdaten nicht laden.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    // Cleanup when component unmounts
    return () => {
      cancelled = true;
      ac.abort();
    };
  }, []);

  return (
    <div className="bg-white/90 border border-gray-200 rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Zahlungsmethode</h2>
      <p className="text-gray-600 mb-5">
        Hinterlege hier deine Karte. Du kannst diesen Schritt jederzeit
        überspringen und später wiederkommen.
      </p>

      {/* Loading state */}
      {loading && <div className="text-gray-500">Lade…</div>}

      {/* Error state */}
      {!loading && error && <div className="text-red-600 mb-4">{error}</div>}

      {/* List saved payment methods if any */}
      {!loading && items.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">
            Gespeicherte Karten
          </h3>
          <ul className="space-y-2">
            {items.map((pm) => (
              <li
                key={pm.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-2"
              >
                {/* Show masked card details */}
                <div className="text-gray-700">
                  {pm.brand ?? "Karte"} •••• {pm.last4} — {pm.exp_month}/
                  {pm.exp_year}
                </div>

                {/* Badge if this is the default card */}
                {pm.is_default && (
                  <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                    Standard
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Always render SaveCardForm, so user can add new card or skip */}
      <SaveCardForm
        title="Kredit- oder Debitkarte hinzufügen"
        showSkip
        onSuccess={() => {
          // After saving a card, reload or redirect to dashboard
          window.location.replace("/dashboard");
        }}
        onSkip={() => {
          // If user skips, also redirect to dashboard
          window.location.replace("/dashboard");
        }}
      />
    </div>
  );
}
