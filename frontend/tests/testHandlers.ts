/**
 * testHandlers.ts
 * ----------------
 * MSW handlers for our real axios/fetch calls.
 * IMPORTANT: axios in api.ts uses an ABSOLUTE baseURL. To match requests in tests,
 * we build absolute URLs here too (using the same env defaults).
 *
 * How this maps:
 * - api.ts → baseURL: http://127.0.0.1:8000/api/elearning
 * - userAdminApi.ts → endpoints like /users/admin/users/ (relative to baseURL)
 * - microsoft_auth.ts → baseURL: http://127.0.0.1:8000/api/microsoft
 * - contentApi.ts → fetch('/content/:chapter.json') (relative)
 */

import { http, HttpResponse } from "msw";
import { mockUser } from "./testMocks";

// Build absolute bases to match axios' absolute requests
const API_BASE = (
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api/elearning"
).replace(/\/+$/, "");
const MS_API_BASE = (
  import.meta.env.VITE_MICROSOFT_API_URL ??
  "http://127.0.0.1:8000/api/microsoft"
).replace(/\/+$/, "");
const API_PAYMENT_BASE = "http://127.0.0.1:8000/api/payments".replace(
  /\/+$/,
  "",
);
const MS_TOOL = (
  import.meta.env.VITE_MICROSOFT_TOOL_SLUG ?? "e-learning"
).replace(/^\/+|\/+$/g, "");

// Helpers to keep endpoints readable
const E = (path: string) => `${API_BASE}${path}`;
const M = (path: string) => `${MS_API_BASE}${path}`;
const P = (path: string) => `${API_PAYMENT_BASE}${path}`;

// Helper: parse request body as a plain object (TS-safe narrowing)
async function parseJsonObject(
  request: Request,
): Promise<Record<string, unknown>> {
  const data = await request.json();
  return data as Record<string, unknown>;
}

export const handlers = [
  /* ----------------------------- Auth (token refresh) ----------------------------- */
  // api.ts calls axios.post(`${API_URL}/token/refresh/`, ...)
  http.post(E("/token/refresh/"), async () => {
    // Simulate "refresh ok" via cookie-based session; no token body needed
    return HttpResponse.json({ success: true });
  }),

  http.options(E("/users/me"), async () => {
    return HttpResponse.json({
      status: 200,
    });
  }),

  http.get(E("/users/me"), async () => {
    return HttpResponse.json(mockUser, { status: 200 });
  }),

  /* ----------------------------- User Admin API ---------------------------------- */
  // Base path in userAdminApi: /users/admin/users
  // All requests are relative to API_BASE (elearning)
  http.get(E("/users/admin/users/"), async () => {
    return HttpResponse.json([
      {
        id: 1,
        username: "alice",
        email: "alice@example.com",
        is_active: true,
        is_staff: true,
        is_superuser: false,
      },
      {
        id: 2,
        username: "bob",
        email: "bob@example.com",
        is_active: true,
        is_staff: false,
        is_superuser: false,
      },
    ]);
  }),

  http.get(E("/users/admin/users/simplified_list/"), async () => {
    return HttpResponse.json([
      {
        id: 1,
        username: "alice",
        email: "alice@example.com",
        name_abbreviation: "ALC",
      },
      {
        id: 2,
        username: "bob",
        email: "bob@example.com",
        name_abbreviation: "BOB",
      },
    ]);
  }),

  http.get(E("/users/admin/users/:id/"), async ({ params }) => {
    const id = Number(params.id);
    return HttpResponse.json({
      id,
      username: id === 1 ? "alice" : "bob",
      email: id === 1 ? "alice@example.com" : "bob@example.com",
      is_active: true,
      is_staff: id === 1,
      is_superuser: false,
    });
  }),

  // CREATE
  http.post(E("/users/admin/users/"), async ({ request }) => {
    const body = await parseJsonObject(request);
    return HttpResponse.json({ id: 3, ...body }, { status: 201 });
  }),

  // UPDATE
  http.put(E("/users/admin/users/:id/"), async ({ params, request }) => {
    const id = Number(params.id);
    const patch = await parseJsonObject(request);
    return HttpResponse.json({ id, ...patch });
  }),

  // DELETE
  http.delete(E("/users/admin/users/:id/"), async () => {
    return HttpResponse.text("", { status: 204 });
  }),

  http.get(E("/users/admin/users/staff_users/"), async () => {
    return HttpResponse.json([
      { id: 1, username: "alice", email: "alice@example.com", is_staff: true },
    ]);
  }),

  http.get(E("/users/admin/users/admin_users/"), async () => {
    return HttpResponse.json([
      {
        id: 99,
        username: "admin",
        email: "admin@example.com",
        is_superuser: true,
      },
    ]);
  }),

  http.post(
    E("/users/admin/users/:id/set_staff_status/"),
    async ({ params, request }) => {
      const id = Number(params.id);
      const body = (await parseJsonObject(request)) as { is_staff?: boolean };
      return HttpResponse.json({ id, is_staff: Boolean(body.is_staff) });
    },
  ),

  http.post(
    E("/users/admin/users/:id/set_active_status/"),
    async ({ params, request }) => {
      const id = Number(params.id);
      const body = (await parseJsonObject(request)) as { is_active?: boolean };
      return HttpResponse.json({ id, is_active: Boolean(body.is_active) });
    },
  ),

  // Initial password set (absolute in code): POST `${API_URL}/users/set-initial-password/`
  http.post(E("/users/set-initial-password/"), async ({ request }) => {
    type InitialPasswordSetBody = {
      new_password?: string;
      new_password_confirm?: string;
    };
    const body = (await parseJsonObject(request)) as InitialPasswordSetBody;

    if (
      body?.new_password &&
      body?.new_password_confirm === body?.new_password
    ) {
      return HttpResponse.json({ message: "Password set" });
    }
    return HttpResponse.json(
      { error: "Passwords do not match" },
      { status: 400 },
    );
  }),

  /* ----------------------------------- Modules ----------------------------------- */
  http.options(E("/modules/user/"), async () => {
    return HttpResponse.json({
      status: 200,
    });
  }),

  http.get(E("/modules/user/"), async () => {
    return HttpResponse.json([]);
  }),

  /* ----------------------------------- Stripe ------------------------------------ */
  http.post(P(`/stripe/checkout-session/`), async () =>
    HttpResponse.json({
      checkout_url: "https://stripe.test/checkout-session-123",
      id: "default",
    }),
  ),

  http.post(P(`/stripe/setup-intent/`), async () =>
    HttpResponse.json({
      client_secret: "cs_test",
    }),
  ),

  http.get(P(`/stripe/config/`), async () =>
    HttpResponse.json({
      publishableKey: "pubkey_test",
    }),
  ),

  /* ----------------------------- Microsoft Auth API ------------------------------ */
  // POST `${MS_API_BASE}/auth/callback/${MS_TOOL}/`
  http.post(M(`/auth/callback/${MS_TOOL}/`), async () => {
    return HttpResponse.json({
      success: true,
      message: "Authenticated",
      user: {
        id: 1,
        username: "alice",
        email: "alice@example.com",
        first_name: "Alice",
        last_name: "A",
        is_staff: true,
        is_superuser: false,
      },
      role_info: {
        role_name: "staff",
        groups: ["staff"],
        is_staff: true,
        is_superuser: false,
        permissions: {
          can_access_admin: true,
          can_manage_users: true,
          can_manage_content: true,
        },
      },
      organization_info: {
        display_name: "Alice A",
        job_title: "Engineer",
        department: "IT",
        office_location: "HH",
        account_enabled: true,
      },
      tokens: { access: "access-token", refresh: "refresh-token" },
      expires_in: 3600,
    });
  }),

  // GET `${MS_API_BASE}/auth/user-status/`
  http.get(M("/auth/user-status/"), async () => {
    return HttpResponse.json({
      success: true,
      active: true,
      user: {
        email: "alice@example.com",
        display_name: "Alice A",
        job_title: "Engineer",
        department: "IT",
        account_enabled: true,
      },
    });
  }),

  /* ----------------------------- Static Content --------------------------------- */
  // contentApi.ts uses fetch('/content/:chapter.json')
  http.get("/content/:chapter.json", async ({ params }) => {
    const chapter = params.chapter as string;
    return HttpResponse.json({
      content: [
        { type: "title", text: `Chapter ${chapter}` },
        { type: "text", text: "Lorem ipsum" },
      ],
    });
  }),
];
