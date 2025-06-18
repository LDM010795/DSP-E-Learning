/**
 * Microsoft Organization Login Button Component
 *
 * Sicherer Button für Microsoft Organization Authentication mit temporären Auth-Codes
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
  const { isLoading, error, loginWithMicrosoft, clearError } = useMicrosoftAuth();

  const handleMicrosoftLogin = async (): Promise<void> => {
    try {
      clearError();
      await loginWithMicrosoft();
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Microsoft login failed";
      onError?.(errorMessage);
    }
  };

  // Fehlerbehandlung
  React.useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  return (
    <button
      type="button"
      onClick={handleMicrosoftLogin}
      disabled={disabled || isLoading}
      className={`
        flex items-center justify-center gap-3 w-full px-4 py-3 
        bg-white border border-gray-300 rounded-lg shadow-sm
        hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        text-gray-700 font-medium
        ${className}
      `}
      aria-label="Mit Microsoft anmelden"
    >
      {/* Microsoft Logo */}
      <svg
        className="w-5 h-5"
        viewBox="0 0 23 23"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="1" y="1" width="10" height="10" fill="#F25022" />
        <rect x="12" y="1" width="10" height="10" fill="#00A4EF" />
        <rect x="1" y="12" width="10" height="10" fill="#00BCF2" />
        <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
      </svg>

      {/* Button Text */}
      <span>
        {isLoading ? "Anmeldung läuft..." : "Mit Microsoft anmelden"}
      </span>

      {/* Loading Spinner */}
      {isLoading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
      )}
    </button>
  );
};

export default MicrosoftLoginButton;
