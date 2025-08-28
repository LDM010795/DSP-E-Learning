/**
 * Payments Success Page
 * =====================
 * Purpose
 * -------
 * Landing page after a successful Stripe Checkout Session.
 * Reads query params that Stripe appended:
 *   - session_id (CHECKOUT_SESSION_ID)
 *   - course (your internal ID passed as metadata/query param)
 *
 * UX
 * --
 * - Shows a friendly success message.
 * - Provides a clear next step (e.g., go to dashboard or course).
 * - Uses minimal state to avoid unnecessary re-renders.
 *
 * Notes
 * -----
 * - We do not call Stripe from the frontend here (keep it simple).
 * - Backend webhooks (dj-stripe + signals) already enroll the user.
 *
 * Author: DSP Development Team
 * Date: 2025-08-26
 */

import React from "react";
import { useNavigate } from "react-router-dom";

/** Helper to extract query params like session_id / course */
function useQueryParam(name: string): string | null {
  const value = new URLSearchParams(window.location.search).get(name);
  return value;
}

/**
 * Middle-ellipsis truncation for long IDs
 * Example: cs_test_abc123...xyz789
 */
function truncateMiddle(s: string, left = 8, right = 8): string {
  if (!s) return "";
  if (s.length <= left + right + 3) return s;
  return `${s.slice(0, left)}…${s.slice(-right)}`;
}

const PaymentsSuccess: React.FC = () => {
  const navigate = useNavigate();
  const sessionId = useQueryParam("session_id"); // e.g. "cs_test_..."
  const courseId = useQueryParam("course");      // e.g. "standard"

  // Go next: default → dashboard (could also be course detail page)
  const handleGoNext = React.useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  // Truncate the Session-ID for display
  const shortSession = sessionId ? truncateMiddle(sessionId, 10, 10) : "";

  // Copy full Session-ID to clipboard (optional helper)
  const copySessionId = async () => {
    if (!sessionId) return;
    try {
      await navigator.clipboard.writeText(sessionId);
      // (Optional) add toast/snackbar here
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white/95 shadow-xl rounded-2xl p-8 border border-white/20 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Zahlung erfolgreich 🎉</h1>
        <p className="text-gray-600">
          Vielen Dank! Deine Zahlung wurde verarbeitet und dein Zugang wird eingerichtet.
        </p>

        {/* Meta info: show truncated Session-ID + copy option, and course ID */}
        <div className="mt-6 text-left space-y-2 text-sm text-gray-600">
          {sessionId && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Session-ID:</span>
              <span className="font-mono text-gray-700" title={sessionId}>
                {shortSession}
              </span>
              <button
                type="button"
                onClick={copySessionId}
                className="text-[#ff863d] hover:underline"
              >
                Kopieren
              </button>
            </div>
          )}
          {courseId && (
            <div>
              <span className="font-medium text-gray-700">Kurs-ID:</span>{" "}
              <span className="text-gray-700">{courseId}</span>
            </div>
          )}
        </div>

        {/* CTA: go back to dashboard */}
        <button
          type="button"
          onClick={handleGoNext}
          className="mt-8 px-5 py-2.5 rounded-xl bg-orange-600 text-white hover:bg-orange-700"
        >
          Weiter zum Dashboard
        </button>
      </div>
    </div>
  );
};

export default PaymentsSuccess;
