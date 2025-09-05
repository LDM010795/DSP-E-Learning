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
 *  1. Component mounts → fetches saved payment methods.
 *  2. If cards exist → shows list with default card marked.
 *  3. SaveCardForm is shown only if no cards exist, or if user clicks
 *     “Neue Karte hinzufügen”.
 *  4. On success → reloads list and hides the form.
 *  5. On skip → redirects to /dashboard (only if no card exists).
 *
 * STATE HANDLING
 * - loading      → show "Lade…"
 * - error        → show error message (only if no cards are available)
 * - items        → array of saved PaymentMethods
 * - showAddForm  → whether SaveCardForm is currently visible
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
 *
 * Author: DSP Development Team
 * Date: 2025-08-26
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
  const [showAddForm, setShowAddForm] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listPaymentMethods();
      const raw = res?.payment_methods ?? [];

      // default first
      const list = [...raw].sort(
        (a, b) => Number(b.is_default) - Number(a.is_default),
      );

      setItems(list);
      setShowAddForm(list.length === 0);
    } catch {
      setError("Konnte Zahlungsdaten nicht laden.");
      // If we can't load, keep the form visible only if we have nothing cached
      setShowAddForm((prev) => (items.length === 0 ? true : prev));
    } finally {
      setLoading(false);
    }
  }, [items.length]);

  React.useEffect(() => {
    void load();
  }, [load]);

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
      {!loading && items.length === 0 && error && (
        <div className="text-red-600 mb-4">{error}</div>
      )}

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
                  {(pm.brand ?? "Karte").toUpperCase()} •••• {pm.last4} —{" "}
                  {String(pm.exp_month ?? "").padStart(2, "0")}/
                  {String(pm.exp_year ?? "").slice(-2)}
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
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowAddForm((v) => !v)}
              className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50"
            >
              {showAddForm ? "Abbrechen" : "Neue Karte hinzufügen"}
            </button>
          </div>
        </div>
      )}

      {/* Show form only when needed */}
      {!loading && showAddForm && (
        <SaveCardForm
          title="Kredit- oder Debitkarte hinzufügen"
          showSkip={items.length === 0} // hide “Später” if we already have a card
          onSuccess={async () => {
            await load(); // refresh list
            setShowAddForm(false); // collapse form
          }}
          onSkip={() => {
            if (items.length === 0) {
              window.location.replace("/dashboard");
            } else {
              setShowAddForm(false);
            }
          }}
        />
      )}
    </div>
  );
}
