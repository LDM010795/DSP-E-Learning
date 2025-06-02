import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import * as userAdminApi from "../util/apis/userAdminApi";
import { useAuth } from "../context/AuthContext"; // Import useAuth
import { toast } from "sonner"; // Importieren
import DspNotification from "../components/toaster/notifications/DspNotification"; // Importieren

const ForcePasswordChangePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Benutzerinformationen aus dem Kontext holen

  const [formData, setFormData] = useState({
    new_password: "",
    new_password_confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.new_password || formData.new_password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen lang sein.");
      return false;
    }
    if (formData.new_password !== formData.new_password_confirm) {
      setError("Passwörter stimmen nicht überein.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await userAdminApi.setInitialPassword({
        new_password: formData.new_password,
        new_password_confirm: formData.new_password_confirm,
      });

      if (result.message) {
        setSuccess(
          result.message + " Sie werden zum Dashboard weitergeleitet..."
        );
        // ERFOLG-TOAST
        toast.custom((t) => (
          <DspNotification
            id={t}
            type="success"
            title="Passwort geändert"
            message="Dein Passwort wurde erfolgreich aktualisiert. Du wirst zum Dashboard weitergeleitet."
          />
        ));
        // Weiterleitung nach kurzer Verzögerung, damit Toast sichtbar ist
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else if (result.error) {
        setError(result.error);
        // FEHLER-TOAST
        toast.custom((t) => (
          <DspNotification
            id={t}
            type="error"
            title="Fehler beim Ändern"
            message={`${result.error}`}
          />
        ));
      }
    } catch (err: unknown) {
      console.error("Fehler beim Setzen des initialen Passworts:", err);
      interface ErrorResponse {
        response?: {
          data?: { [key: string]: string[] | string };
          status?: number;
        };
        message?: string;
      }
      const error = err as ErrorResponse;
      let errorMessage = "Ein unerwarteter Fehler ist aufgetreten.";
      if (error.response?.data) {
        const data = error.response.data;
        const fieldErrors = Object.entries(data)
          .map(([key, value]) => {
            if (Array.isArray(value)) {
              return `${key}: ${value.join(", ")}`;
            } else if (typeof value === "string") {
              return `${key}: ${value}`;
            }
            return null;
          })
          .filter(Boolean)
          .join("; ");
        if (fieldErrors) {
          errorMessage = `Fehler: ${fieldErrors}`;
        } else if (typeof data === "string") {
          errorMessage = data;
        } else if (error.message) {
          errorMessage = error.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage);
      // FEHLER-TOAST
      toast.custom((t) => (
        <DspNotification
          id={t}
          type="error"
          title="Fehler beim Ändern"
          message={`${errorMessage}`}
        />
      ));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full border border-yellow-300"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Passwort ändern erforderlich
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Hallo {user?.username || "Benutzer"}, zu Ihrer Sicherheit müssen Sie
          bei der ersten Anmeldung Ihr Passwort ändern.
        </p>

        {success ? (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md border border-green-200">
            {success}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="new_password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Neues Passwort
              </label>
              <input
                type="password"
                id="new_password"
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dsp-orange focus:border-dsp-orange"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="new_password_confirm"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Neues Passwort bestätigen
              </label>
              <input
                type="password"
                id="new_password_confirm"
                name="new_password_confirm"
                value={formData.new_password_confirm}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dsp-orange focus:border-dsp-orange"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center space-x-2 rounded-lg py-2.5 px-4 bg-dsp-orange text-white font-bold hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dsp-orange ${
                loading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-opacity-90"
              }`}
            >
              {loading ? "Speichert..." : "Neues Passwort speichern"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForcePasswordChangePage;
