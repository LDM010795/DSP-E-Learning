/**
 * Stripe Loader (Singleton + Perf Hints)
 * =====================================
 *
 * Purpose
 * -------
 * Provide a single, shared Stripe instance to the entire app — and make
 * the first load faster with safe preconnect + warm-up.
 *
 * Key ideas
 * ---------
 * - Singleton by key: memorize the `loadStripe()` Promise per publishable key.
 * - Preconnect: inject <link rel="preconnect"> to Stripe domains once,
 *   so the browser opens TLS + TCP earlier (improves first interaction).
 * - Warm-up: Optional `warmStripe()` to start the async load before it’s
 *   actually needed (e.g., when a “Subscribe” page mounts).
 *
 * Usage
 * -----
 * ```ts
 * import { getStripe, warmStripe } from "@/util/payments/stripe";
 *
 * // later when rendering <Elements>:
 * const stripe = getStripe(publishableKey); // Promise<Stripe | null>
 * <Elements stripe={stripe} options={{ clientSecret }}>...</Elements>
 * ```
 */

import { loadStripe, Stripe } from "@stripe/stripe-js";

/** Internal registry so we only load a Stripe instance once per publishable key. */
const stripePromisesByKey = new Map<string, Promise<Stripe | null>>();

/** Ensure we only inject preconnect hints once. */
let preconnectInjected = false;

/**
 * Add <link rel="preconnect"> hints for Stripe’s domains.
 * Safe to call multiple times; it will only inject once.
 *
 * Note: These hints help the browser establish early connections (DNS, TCP, TLS),
 * which reduces the time to interactive when Stripe Elements is first used.
 */
function injectPreconnectHints(): void {
  if (preconnectInjected || typeof document === "undefined") return;
  preconnectInjected = true;

  const HINTS = [
    { href: "https://js.stripe.com", crossOrigin: "" },
    { href: "https://api.stripe.com", crossOrigin: "" },
    // Optional assets paths used by Elements:
    { href: "https://m.stripe.network", crossOrigin: "" },
  ];

  for (const { href, crossOrigin } of HINTS) {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = href;
    if (crossOrigin !== undefined) link.crossOrigin = crossOrigin;
    document.head.appendChild(link);
  }
}

/**
 * Get (or create) a memoized Stripe instance for a given publishable key.
 * This returns the *same* Promise for the same key, preventing duplicate loads.
 *
 * @param publishableKey Stripe publishable key (test or live)
 * @returns Promise<Stripe | null> (Stripe returns null if key looks invalid)
 */
export function getStripe(publishableKey: string): Promise<Stripe | null> {
  injectPreconnectHints();

  if (!publishableKey) {
    if (import.meta.env?.MODE !== "production") {
      // eslint-disable-next-line no-console
      console.warn(
        "[Stripe] Missing publishable key — did you fetch /stripe/config/?",
      );
    }
    // Still return a stable Promise to avoid crashing call sites.
    return Promise.resolve(null);
  }

  const existing = stripePromisesByKey.get(publishableKey);
  if (existing) return existing;

  const created = loadStripe(publishableKey);
  stripePromisesByKey.set(publishableKey, created);
  return created;
}

/**
 * Warm-up helper:
 * Triggers loading Stripe (and preconnect) ahead of time to shave off latency
 * when the user reaches the actual payment step.
 *
 * Call this in a `useEffect` on pages like Subscriptions or Payment Onboarding.
 */
export function warmStripe(publishableKey: string): void {
  // Fire and forget — if it’s already loading/loaded, this is a no-op.
  void getStripe(publishableKey);
}

/**
 * (Rarely needed) Reset all memoized Stripe instances — useful in tests
 * or when you dynamically switch accounts/keys at runtime.
 */
export function resetStripeCache(): void {
  stripePromisesByKey.clear();
  preconnectInjected = false;
}
