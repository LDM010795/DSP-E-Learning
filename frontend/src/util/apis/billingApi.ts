/**
 * Stripe Billing API Helpers
 * ==========================
 *
 * This module contains small wrapper functions around the Django backend
 * payment endpoints. They provide a typed interface for the frontend
 * to call Stripe-related APIs (SetupIntent, checkout, etc.) via Axios.
 *
 * All function:
 * - Use the shared Axios instance ('api') which handles baseURL and auth.
 * - Return parsed JSON data (not the full Axios response).
 * - Throw on error: always wrap calls in try/catch in UI components.
 *
 * Endpoints covered:
 * ------------------
 *
 * - GET  /api/elearning/payments/stripe/config/        → Stripe publishable key
 * - POST /api/elearning/payments/stripe/setup-intent/  → SetupIntent client secret
 * - POST /api/elearning/payments/stripe/checkout-session/ → CheckoutSession URL + id
 * - GET  /api/elearning/payments/stripe/payment-methods/ → List saved cards
 * - POST /api/elearning/payments/stripe/payment-methods/default/ → Set default card
 *
 * Usage:
 * ------
 * ```ts
 * import { getStripeConfig, createSetupIntent } from "../util/apis/billingApi";
 *
 * const { publishableKey } = await getStripeConfig();
 * const { client_secret } = await createSetupIntent();
 * ```
 *
 */

import api from "../../util/apis/api.ts";

// ---------- Types ----------

export type StripeConfigResponse = { publishableKey: string };
export type SetupIntentResponse = { client_secret: string };
export type CheckoutSessionPayload = {
  price_id: string;
  course_id: number | string;
};
export type CheckoutSessionResponse = { checkout_url: string; id: string };
export type PaymentMethodCard = {
  id: string;
  brand?: string;
  last4?: string;
  exp_month?: number;
  exp_year?: number;
  is_default: boolean;
};
export type ListPaymentMethodsResponse = {
  payment_methods: PaymentMethodCard[];
};

// ---------- Tiny TTL Cache & In-flight Registry ----------

type CacheEntry<T> = { expiresAt: number; value: T };
const ttlCache = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

/** Read from cache if not expired. */
function cacheGet<T>(key: string): T | null {
  const hit = ttlCache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    ttlCache.delete(key);
    return null;
  }
  return hit.value as T;
}

/** Write to cache with TTL in ms. */
function cacheSet<T>(key: string, value: T, ttlMs: number) {
  ttlCache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/** Normalize a payload to a stable string key. */
function keyOf(base: string, payload?: unknown) {
  return payload ? `${base}:${JSON.stringify(payload)}` : base;
}

// ---------- Throttle & Debounce (minimal, per-key) ----------

const lastRun = new Map<string, number>();
function throttleKey<TArgs extends unknown[], TOut>(
  keyBase: string,
  intervalMs: number,
  fn: (...args: TArgs) => Promise<TOut>,
) {
  return async (...args: TArgs) => {
    const key = keyOf(keyBase, args);
    const now = Date.now();
    const prev = lastRun.get(key) ?? 0;
    if (now - prev < intervalMs) {
      // Fast fail: prevent spam clicking
      throw new Error("THROTTLED");
    }
    lastRun.set(key, now);
    return fn(...args);
  };
}

const debounceTimers = new Map<string, number>();
function debounceKey<TArgs extends unknown[], TOut>(
  keyBase: string,
  delayMs: number,
  fn: (...args: TArgs) => Promise<TOut>,
) {
  return (...args: TArgs) =>
    new Promise<TOut>((resolve, reject) => {
      const key = keyOf(keyBase, args);
      const prev = debounceTimers.get(key);
      if (prev) window.clearTimeout(prev);
      const id = window.setTimeout(async () => {
        debounceTimers.delete(key);
        try {
          resolve(await fn(...args));
        } catch (e) {
          reject(e);
        }
      }, delayMs);
      debounceTimers.set(key, id as unknown as number);
    });
}

// ---------- Helpers to dedupe in-flight calls ----------

async function dedup<T>(key: string, factory: () => Promise<T>): Promise<T> {
  if (inflight.has(key)) {
    return inflight.get(key) as Promise<T>;
  }
  const p = factory().finally(() => {
    inflight.delete(key);
  });
  inflight.set(key, p as Promise<unknown>);
  return p;
}

// ---------- Public API ----------

/**
 * Returns Stripe publishable key.
 * Cached for 10 minutes (600_000ms). De-duplicates concurrent callers.
 */
export async function getStripeConfig(
  signal?: AbortSignal,
): Promise<StripeConfigResponse> {
  const cacheKey = "stripe:config";
  const cached = cacheGet<StripeConfigResponse>(cacheKey);
  if (cached) return cached;

  return dedup(cacheKey, async () => {
    const { data } = await api.get<StripeConfigResponse>(
      "/payments/stripe/config/",
      { signal },
    );
    cacheSet(cacheKey, data, 600_000);
    return data;
  });
}

/**
 * Creates a SetupIntent (save a card).
 * Debounced to collapse rapid submit clicks.
 * Accepts AbortSignal to cancel if component unmounts.
 */
const _createSetupIntent = async (
  signal?: AbortSignal,
): Promise<SetupIntentResponse> => {
  const { data } = await api.post<SetupIntentResponse>(
    "/payments/stripe/setup-intent/",
    {},
    { signal },
  );
  return data;
};

export const createSetupIntent = debounceKey<
  [AbortSignal?],
  SetupIntentResponse
>("stripe:setup-intent", 800, _createSetupIntent);

/**
 * Creates a Checkout Session (one-off purchase).
 * Throttled per distinct payload to prevent accidental double checkout.
 * Throws Error("THROTTLED") if called too quickly with the same args.
 */
const _createCheckoutSession = async (
  payload: CheckoutSessionPayload,
  signal?: AbortSignal,
): Promise<CheckoutSessionResponse> => {
  const body = {
    price_id: payload.price_id,
    course_id: String(payload.course_id),
  };
  const { data } = await api.post<CheckoutSessionResponse>(
    "/payments/stripe/checkout-session/",
    body,
    { signal },
  );
  return data;
};

export const createCheckoutSession = throttleKey<
  [CheckoutSessionPayload, AbortSignal?],
  CheckoutSessionResponse
>("stripe:checkout", 2_000, _createCheckoutSession);

/**
 * Lists saved payment methods.
 * Cached keep UI snappy while avoiding stale data.
 * De-duplicates concurrent callers.
 */
export async function listPaymentMethods(
  signal?: AbortSignal,
): Promise<ListPaymentMethodsResponse> {
  const cacheKey = "stripe:payment-methods";
  const cached = cacheGet<ListPaymentMethodsResponse>(cacheKey);
  if (cached) return cached;

  return dedup(cacheKey, async () => {
    const { data } = await api.get<ListPaymentMethodsResponse>(
      "/payments/stripe/payment-methods/",
      { signal },
    );
    cacheSet(cacheKey, data, 30_000);
    return data;
  });
}

/**
 * Sets default payment method for user’s customer.
 * Invalidates the local payment methods cache upon success.
 */
export async function setDefaultPaymentMethod(
  payment_method_id: string,
  signal?: AbortSignal,
): Promise<{ detail: string }> {
  const { data } = await api.post<{ detail: string }>(
    "/payments/stripe/payment-methods/default/",
    { payment_method_id },
    { signal },
  );
  // bust cache so next list fetch is fresh
  ttlCache.delete("stripe:payment-methods");
  return data;
}
