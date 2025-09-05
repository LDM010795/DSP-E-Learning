/**
 * ExternalRegister.tsx — External User Registration (Frontend)
 * =====================================================================
 * ROLE
 * - Presents a public registration form for non-SSO users.
 * - Validates user input client-side and submits to the backend.
 * - Gives clear success/error feedback and redirects to /login after success.
 *
 * CONTEXT
 * - This component belongs to the E-Learning platform’s public auth flow.
 * - It complements the backend endpoint:
 *     POST  {VITE_API_URL}/users/register/
 *   where VITE_API_URL is set in `.env.local`, e.g.:
 *     VITE_API_URL=http://127.0.0.1:8000/api/elearning
 * - Axios instance is configured in `src/utils/api.ts` and includes:
 *     baseURL = VITE_API_URL
 *     JSON headers
 *     credentials and token interceptors (though this public route needs no token)
 *
 * PRIMARY USER STORY
 * - As a new external learner, I should be able to register with username,
 *   email, and password, receive immediate feedback, and be guided to log in.
 *
 * REQUEST CONTRACT (Frontend → Backend)
 * - Method: POST
 * - URL:   `${VITE_API_URL}/users/register/`
 * - Body (JSON):
 *   {
 *     "username": string,
 *     "email": string,
 *     "first_name": string,   // optional, persisted
 *     "last_name": string,    // optional, persisted
 *     "password": string,     // min 8 chars
 *     "password_confirm": string // must match password
 *   }
 *
 * RESPONSE CONTRACT (Backend → Frontend)
 * - 201 Created:
 *     { "detail": "Registration successful." }
 *   → UI shows success banner, then navigates to /login after ~1.5s
 * - 400 Bad Request (DRF validation errors):
 *     {
 *       "email": ["A user with this email already exists."],
 *       "password_confirm": ["Passwords do not match"]
 *     }
 *   → Component normalizes to { field: message } and renders inline + banner
 *
 * ENV & CONFIG
 * - Vite env is used at build time. Ensure `.env.local` contains:
 *     VITE_API_URL=http://127.0.0.1:8000/api/elearning
 * - IMPORTANT: We append `/users/register/` in code. If you include `/api` in
 *   VITE_API_URL, do NOT add `/api` again in paths to avoid double prefixes.
 *
 * DATA FLOW (High-level)
 * 1) Controlled inputs update local `form` state.
 * 2) Derived flags compute validity (email format, password length/match).
 * 3) On submit:
 *    - Guard against invalid form and double-clicks.
 *    - POST via Axios to `/users/register/`.
 *    - On success: show success message + redirect to /login.
 *    - On failure: read Axios error response, normalize DRF errors, render inline.
 *
 * VALIDATION (Client-side)
 * - Required: username, email, password, password_confirm.
 * - Email: simple regex (server remains the source of truth).
 * - Password: min 8 chars; confirm must match.
 * - Note: Client validation is UX only; server enforces real rules.
 *
 * ERROR HANDLING STRATEGY
 * - AxiosError is inspected for `response.data`.
 * - DRF typically returns field→array messages; we flatten to `Record<string,string>`.
 * - If field errors exist: show banner “Bitte korrigiere…” + inline messages.
 * - If no field granularity: show generic failure banner.
 *
 * ACCESSIBILITY & UX
 * - Inputs provide `autoComplete` hints (username/email/password).
 * - Icons are decorative (`aria-hidden`) and don’t hijack focus.
 * - Submit disabled while invalid or loading to prevent duplicates.
 * - Password field supports show/hide toggle with accessible label.
 * - Success feedback is visible before navigation occurs.
 *
 * SECURITY NOTES
 * - Never log or echo passwords.
 * - Transport must be HTTPS in production.
 * - This endpoint is public; server should enforce appropriate throttling/CORS.
 *
 * DEPENDENCIES
 * - React, react-router-dom
 * - Axios (via configured instance in `src/utils/apis/api.ts`)
 * - react-icons/io5 (input adornments)
 * - ButtonPrimary, LoadingSpinner (local UI atoms)
 *
 * TESTING HINTS (RTL/Jest)
 * - Renders all fields and disables submit when invalid.
 * - Shows inline error when passwords mismatch.
 * - Calls `api.post("/users/register/", payload)` with exact body on valid submit.
 * - Displays success banner and triggers navigation function.
 * - Displays normalized field error under the correct input on 400.
 *
 * MAINTENANCE & EXTENSIBILITY
 * - If server adds fields (e.g., termsAccepted), extend FormState and form UI.
 * - If the endpoint path changes, only update the single `api.post` path.
 * - If i18n is introduced globally, replace hard-coded strings with t() keys.
 * - Consider extracting form controls into reusable inputs as the design system grows.
 *
 * COMMON PITFALLS
 * - Double `/api` in URLs: keep VITE_API_URL as the API root; append relative paths only.
 * - ESLint “unused” warnings: ensure icons/state/hooks are used in JSX.
 * - Interceptor loops: token refresh logic is in the shared Axios client;
 *   keep registration unauthenticated and avoid calling `/token` here.
 */

import React, { useMemo, useRef, useState } from "react";
import LogoDSP from "../assets/dsp_no_background.png";
import {
  IoMailOutline,
  IoPersonOutline,
  IoLockClosedOutline,
  IoEyeOffOutline,
  IoEyeOutline,
} from "react-icons/io5";
import ButtonPrimary from "../components/ui_elements/buttons/button_primary.tsx";
import LoadingSpinner from "../components/ui_elements/loading_spinner.tsx";
import { useNavigate } from "react-router-dom";
import api from "../util/apis/api.ts";
import type { AxiosError } from "axios";

/** --- Types --- */

type FormState = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
};

type FieldErrors = Record<string, string>;

/** --- Helpers --- */

const isEmail = (value: string): boolean => /\S+@\S+\.\S+/.test(value);

/** Flatten DRF error payloads into { field: message } */
function normalizeFieldErrors(data: unknown): FieldErrors {
  const out: FieldErrors = {};
  if (!data || typeof data !== "object") return out;

  for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
    if (Array.isArray(val)) out[key] = String(val[0] ?? "");
    else if (typeof val === "object" && val !== null)
      out[key] = JSON.stringify(val);
    else out[key] = String(val ?? "");
  }
  return out;
}

/** --- Component --- */
const ExternalRegister: React.FC = () => {
  // Form state
  const [form, setForm] = useState<FormState>({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password_confirm: "",
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const navigate = useNavigate();

  // Prevent double-submit
  const submitRef = useRef<boolean>(false);

  // Derived validation flags
  const passwordsMismatch = useMemo(
    () =>
      form.password.length > 0 &&
      form.password_confirm.length > 0 &&
      form.password !== form.password_confirm,
    [form.password, form.password_confirm],
  );

  const emailInvalid = useMemo(() => {
    if (!form.email) return false;
    return !isEmail(form.email);
  }, [form.email]);

  const isFormValid = useMemo(() => {
    if (
      !form.username ||
      !form.email ||
      !form.password ||
      !form.password_confirm
    )
      return false;
    if (emailInvalid || passwordsMismatch) return false;
    if (form.password.length < 8 || form.password_confirm.length < 8)
      return false;
    return true;
  }, [form, emailInvalid, passwordsMismatch]);

  /** Update inputs and clear stale errors */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (Object.keys(fieldErrors).length) setFieldErrors({});
    if (error) setError(null);
  };

  /** Submit form → POST /users/register/ */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (submitRef.current) return;

    if (!isFormValid) {
      const next: FieldErrors = {};
      if (passwordsMismatch)
        next.password_confirm = "Passwörter stimmen nicht überein.";
      if (emailInvalid)
        next.email = "Bitte eine gültige E-Mail-Adresse eingeben.";
      setFieldErrors(next);
      setError("Bitte korrigiere die markierten Fehler.");
      return;
    }

    setLoading(true);
    setError(null);
    setFieldErrors({});
    setSuccessMsg(null);
    submitRef.current = true;

    try {
      // baseURL is VITE_API_URL (e.g., http://127.0.0.1:8000/api/elearning)
      await api.post("/users/register/", form);
      // Auto-login immediately
      const loginRes = await api.post("/token/", {
        username: form.username,
        password: form.password,
      });

      // Store tokens for Axios interceptors
      localStorage.setItem("authTokens", JSON.stringify(loginRes.data));

      setSuccessMsg("Registrierung erfolgreich! Willkommen 🎉");
      setTimeout(() => navigate("/subscriptions"), 1200);
    } catch (err) {
      const axErr = err as AxiosError<unknown>;
      const payload = axErr.response?.data ?? null;
      const normalized = normalizeFieldErrors(payload);

      if (Object.keys(normalized).length > 0) {
        setFieldErrors(normalized);
        setError("Bitte korrigiere die markierten Fehler.");
      } else {
        setError("Registrierung fehlgeschlagen. Bitte versuche es erneut.");
      }
    } finally {
      setLoading(false);
      submitRef.current = false;
    }
  };

  /** --- Render --- */
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-dsp-orange_light/40 to-white px-4">
      <div className="max-w-md w-full bg-white/95 shadow-xl rounded-2xl p-8 space-y-6 border border-white/20">
        {/* Header / Brand */}
        <div className="flex flex-col items-center space-y-2 mb-4">
          <img src={LogoDSP} alt="DSP Logo" className="h-14 mb-2" />
          <h1 className="text-3xl font-bold text-gray-800">Registrieren</h1>
          <p className="text-gray-600 text-center text-base">
            Erstelle einen Account als externer Nutzer.
          </p>
        </div>

        {/* Global Messages */}
        {successMsg && (
          <div className="bg-green-100 border border-green-300 text-green-700 rounded-xl p-4 text-center font-medium">
            {successMsg}
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 rounded-xl p-4 text-center font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Username */}
          <div>
            <label
              className="block text-sm font-semibold mb-1"
              htmlFor="username"
            >
              Benutzername
            </label>
            <div className="relative">
              <IoPersonOutline
                className="absolute left-3 top-3 text-gray-400"
                aria-hidden
              />
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                className={`w-full pl-10 pr-3 py-2 border rounded-xl shadow-sm bg-white/60 focus:ring-2 focus:border-orange-400 ${
                  fieldErrors.username ? "border-red-400" : "border-gray-200"
                }`}
                placeholder="Benutzername"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>
            {fieldErrors.username && (
              <div className="text-sm text-red-500">{fieldErrors.username}</div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-1" htmlFor="email">
              E-Mail
            </label>
            <div className="relative">
              <IoMailOutline
                className="absolute left-3 top-3 text-gray-400"
                aria-hidden
              />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={`w-full pl-10 pr-3 py-2 border rounded-xl shadow-sm bg-white/60 focus:ring-2 focus:border-orange-400 ${
                  fieldErrors.email || emailInvalid
                    ? "border-red-400"
                    : "border-gray-200"
                }`}
                placeholder="E-Mail-Adresse"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            {(fieldErrors.email || emailInvalid) && (
              <div className="text-sm text-red-500">
                {fieldErrors.email ||
                  "Bitte eine gültige E-Mail-Adresse eingeben."}
              </div>
            )}
          </div>

          {/* First name */}
          <div>
            <label
              className="block text-sm font-semibold mb-1"
              htmlFor="first_name"
            >
              Vorname
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              autoComplete="given-name"
              className={`w-full px-3 py-2 border rounded-xl shadow-sm bg-white/60 focus:ring-2 focus:border-orange-400 ${
                fieldErrors.first_name ? "border-red-400" : "border-gray-200"
              }`}
              placeholder="Vorname"
              value={form.first_name}
              onChange={handleChange}
            />
            {fieldErrors.first_name && (
              <div className="text-sm text-red-500">
                {fieldErrors.first_name}
              </div>
            )}
          </div>

          {/* Last name */}
          <div>
            <label
              className="block text-sm font-semibold mb-1"
              htmlFor="last_name"
            >
              Nachname
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              autoComplete="family-name"
              className={`w-full px-3 py-2 border rounded-xl shadow-sm bg-white/60 focus:ring-2 focus:border-orange-400 ${
                fieldErrors.last_name ? "border-red-400" : "border-gray-200"
              }`}
              placeholder="Nachname"
              value={form.last_name}
              onChange={handleChange}
            />
            {fieldErrors.last_name && (
              <div className="text-sm text-red-500">
                {fieldErrors.last_name}
              </div>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              className="block text-sm font-semibold mb-1"
              htmlFor="password"
            >
              Passwort
            </label>
            <div className="relative">
              <IoLockClosedOutline
                className="absolute left-3 top-3 text-gray-400"
                aria-hidden
              />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className={`w-full pl-10 pr-10 py-2 border rounded-xl shadow-sm bg-white/60 focus:ring-2 focus:border-orange-400 ${
                  fieldErrors.password ? "border-red-400" : "border-gray-200"
                }`}
                placeholder="Passwort (mind. 8 Zeichen)"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
              />
              <button
                type="button"
                className="absolute right-3 top-2 text-gray-400 hover:text-orange-500"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={
                  showPassword ? "Passwort verbergen" : "Passwort anzeigen"
                }
              >
                {showPassword ? (
                  <IoEyeOffOutline className="w-5 h-5" />
                ) : (
                  <IoEyeOutline className="w-5 h-5" />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <div className="text-sm text-red-500">{fieldErrors.password}</div>
            )}
          </div>

          {/* Password Confirm */}
          <div>
            <label
              className="block text-sm font-semibold mb-1"
              htmlFor="password_confirm"
            >
              Passwort bestätigen
            </label>
            <div className="relative">
              <IoLockClosedOutline
                className="absolute left-3 top-3 text-gray-400"
                aria-hidden
              />
              <input
                id="password_confirm"
                name="password_confirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className={`w-full pl-10 pr-10 py-2 border rounded-xl shadow-sm bg-white/60 focus:ring-2 focus:border-orange-400 ${
                  fieldErrors.password_confirm || passwordsMismatch
                    ? "border-red-400"
                    : "border-gray-200"
                }`}
                placeholder="Passwort erneut eingeben"
                value={form.password_confirm}
                onChange={handleChange}
                required
                minLength={8}
              />
              <button
                type="button"
                className="absolute right-3 top-2 text-gray-400 hover:text-orange-500"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={
                  showPassword ? "Passwort verbergen" : "Passwort anzeigen"
                }
              >
                {showPassword ? (
                  <IoEyeOffOutline className="w-5 h-5" />
                ) : (
                  <IoEyeOutline className="w-5 h-5" />
                )}
              </button>
            </div>
            {(fieldErrors.password_confirm || passwordsMismatch) && (
              <div className="text-sm text-red-500">
                {fieldErrors.password_confirm ||
                  "Passwörter stimmen nicht überein."}
              </div>
            )}
          </div>

          {/* Submit */}
          <div>
            <ButtonPrimary
              type="submit"
              title={loading ? "Registriere..." : "Registrieren"}
              disabled={loading || !isFormValid}
              classNameButton="w-full"
              onClick={() => {}}
            />
          </div>
        </form>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center mt-4">
            <LoadingSpinner
              message="Registriere..."
              size="md"
              variant="pulse"
              showBackground={false}
            />
          </div>
        )}

        {/* Switch to login */}
        <div className="text-center text-sm mt-4">
          <span>Bereits ein Konto?</span>{" "}
          <button
            className="text-orange-600 hover:underline font-medium"
            onClick={() => navigate("/login")}
            type="button"
          >
            Anmelden
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExternalRegister;
