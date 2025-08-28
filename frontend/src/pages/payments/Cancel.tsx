/**
 * Payments Cancel Page
 * ====================
 * Purpose
 * -------
 * Landing page when a user cancels Stripe Checkout.
 * Reads optional `course` param to customize the follow-up action.
 *
 * UX
 * --
 * - Reassures the user nothing was charged.
 * - Offers to retry checkout or continue browsing.
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

const PaymentsCancel: React.FC = () => {
  const navigate = useNavigate();
  const courseId = useQueryParam("course");

  const handleBackToSubscriptions = React.useCallback(() => {
    navigate("/subscriptions");
  }, [navigate]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white/95 shadow-xl rounded-2xl p-8 border border-white/20 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Zahlung abgebrochen
        </h1>
        <p className="text-gray-600">
          Kein Problem – es wurde nichts berechnet. Du kannst den Kauf jederzeit
          erneut versuchen.
        </p>

        {courseId && (
          <p className="mt-4 text-gray-500 text-sm">
            Kurs-ID: <span className="font-mono">{courseId}</span>
          </p>
        )}

        <div className="mt-8 flex gap-3 justify-center">
          <button
            type="button"
            onClick={handleBackToSubscriptions}
            className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50"
          >
            Zurück zu den Abos
          </button>
          {/* Optional: trigger Subscribe flow again directly here if you wish */}
        </div>
      </div>
    </div>
  );
};

export default PaymentsCancel;
