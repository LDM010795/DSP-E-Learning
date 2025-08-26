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

function useQueryParam(name: string): string | null {
  const value = new URLSearchParams(window.location.search).get(name);
  return value;
}

const PaymentsSuccess: React.FC = () => {
  const navigate = useNavigate();
  const sessionId = useQueryParam("session_id"); // e.g. "cs_test_..."
  const courseId = useQueryParam("course");      // e.g. "42"

  // Keep any logic outside render body (no hooks needed here)
  const handleGoNext = React.useCallback(() => {
    // Choose the next step later:
    // - If there is a course detail page: navigate(`/modules/${courseId}`)
    // - If onboarding flow: navigate("/subscriptions")
    // - Default to dashboard:
    navigate("/dashboard");
  }, [navigate /*, courseId*/]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white/95 shadow-xl rounded-2xl p-8 border border-white/20 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Zahlung erfolgreich 🎉</h1>
        <p className="text-gray-600">
          Vielen Dank! Deine Zahlung wurde verarbeitet und dein Zugang wird eingerichtet.
        </p>

        <div className="mt-6 text-left space-y-1 text-sm text-gray-500">
          {sessionId && <div><span className="font-medium">Session-ID:</span> {sessionId}</div>}
          {courseId && <div><span className="font-medium">Kurs-ID:</span> {courseId}</div>}
        </div>

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
