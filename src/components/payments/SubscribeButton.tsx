/**
 * SubscribeButton
 * ===============
 * A small, resilient CTA that:
 *  - calls our backend to create a Stripe Checkout Session
 *  - redirects the browser to the returned `checkout_url`
 *
 * Performance & UX:
 *  - Double-click protection via disabled state
 *  - Handles throttling from the API helper (prevents rapid duplicates)
 *  - Uses AbortController to cancel the request if the component unmounts
 *  - Minimal, framework-agnostic button styling (override with `className`)
 *
 * Usage:
 * ------
 * <SubscribeButton priceId="price_123" courseId={42} />
 *
 * Props:
 * ------
 * - priceId   : string   (Stripe Price ID)
 * - courseId  : number|string (your internal course identifier)
 * - label?    : string   (button text, defaults to "Jetzt kaufen/abonnieren")
 * - className?: string   (for custom button styles)
 * - onError?  : (msg: string) => void (optional external error hook)
 */

import React from "react";
import { createCheckoutSession } from "../../util/apis/billingApi";

export type SubscribeButtonProps = {
  priceId: string;
  courseId: number | string;
  label?: string;
  className?: string;
  onError?: (message: string) => void;
};

export default function SubscribeButton({
  priceId,
  courseId,
  label = "Jetzt kaufen/abonnieren",
  className,
  onError,
}: SubscribeButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  // Keep a reference to the last in-flight request for cancellation on unmount
  const abortRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    return () => {
      // Cancel any in-flight request when this component unmounts
      abortRef.current?.abort();
    };
  }, []);

  const handleClick = async () => {
    // Prevent double submissions (UI guard; also backed by server-side throttle)
    if (loading) return;

    setLoading(true);
    setErr(null);

    // Abort any previous request just in case (refreshing the controller)
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      // API helper itself is throttled (2s per unique payload) to avoid duplicates.
      const { checkout_url } = await createCheckoutSession(
        { price_id: priceId, course_id: courseId },
        abortRef.current.signal,
      );

      // Hard redirect to Stripe-hosted Checkout
      window.location.assign(checkout_url);
    } catch (e) {
      // Gracefully handle known throttle case (from the optimized helper)
      const message =
        e instanceof Error && e.message === "THROTTLED"
          ? "Bitte warte einen Moment, bevor du es erneut versuchst."
          : "Konnte Checkout-Session nicht erstellen.";

      setErr(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={
          className ??
          "px-4 py-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed"
        }
        aria-busy={loading}
        aria-disabled={loading}
      >
        {loading ? "Weiterleiten…" : label}
      </button>

      {err && (
        <span className="text-sm text-red-600" role="alert">
          {err}
        </span>
      )}
    </div>
  );
}
