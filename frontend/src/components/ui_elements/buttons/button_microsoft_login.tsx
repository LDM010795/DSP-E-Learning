/**
 * Microsoft Organization Login Button Component
 *
 * Provides a clean UI for Microsoft Organization authentication
 */

import React from "react";
import { useMicrosoftAuth } from "../../../hooks/use_microsoft_auth";

interface MicrosoftLoginButtonProps {
  className?: string;
  disabled?: boolean;
  onError?: (error: string) => void;
  onSuccess?: () => void;
}

const MicrosoftLoginButton: React.FC<MicrosoftLoginButtonProps> = ({
  className = "",
  disabled = false,
  onError,
  onSuccess,
}) => {
  const {
    startMicrosoftLogin,
    isLoading,
    error,
    clearError,
    organizationInfo,
    isMicrosoftUser,
  } = useMicrosoftAuth();

  const handleMicrosoftLogin = async () => {
    try {
      clearError();
      const result = await startMicrosoftLogin();

      if (result.success) {
        onSuccess?.();
      } else {
        onError?.(result.error || "Microsoft login failed");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Microsoft login failed";
      onError?.(errorMessage);
    }
  };

  // Wenn User bereits Microsoft User ist, zeige Status
  if (isMicrosoftUser && organizationInfo) {
    return (
      <div
        className={`flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg ${className}`}
      >
        <div className="flex-shrink-0">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-green-800">
            Mit Microsoft angemeldet
          </p>
          <p className="text-sm text-green-600">
            {organizationInfo.display_name} • {organizationInfo.department}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleMicrosoftLogin}
        disabled={disabled || isLoading}
        className={`
          flex items-center justify-center gap-3 w-full px-4 py-3 
          bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg
          transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <MicrosoftIcon />
        )}
        <span>
          {isLoading ? "Authentifizierung läuft..." : "Mit Microsoft anmelden"}
        </span>
      </button>

      {isLoading && (
        <div className="text-xs text-blue-600 text-center space-y-1">
          <p>⚡ Optimiert für schnellere Anmeldung</p>
          <p>
            Falls es länger dauert, wird beim ersten Mal der Server gestartet
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">
                Anmeldung fehlgeschlagen
              </p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center">
        Nur für aktive DSP-Mitarbeiter verfügbar
      </div>
    </div>
  );
};

// Microsoft Icon Component
const MicrosoftIcon: React.FC = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" />
  </svg>
);

export default MicrosoftLoginButton;
