import React, { useState } from "react";
import * as userAdminApi from "../../../util/apis/userAdminApi";
import ButtonPrimary from "../buttons/button_primary";
import {
  IoInformationCircleOutline,
  IoWarningOutline,
  IoCopyOutline,
  IoCheckmarkOutline,
} from "react-icons/io5";
import clsx from "clsx";
import { useDebounce } from "../../../util/performance";

interface CreateUserFormProps {
  onUserCreated?: () => void;
  onCancel?: () => void;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({
  onUserCreated,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    is_staff: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Debounced Form Data für Validierung (500ms Verzögerung)
  const debouncedFormData = useDebounce(formData, 500);

  // Validierungsfunktion
  const validateField = (field: string, value: string): string | null => {
    switch (field) {
      case "username":
        if (!value || value.length < 3) {
          return "Benutzername muss mindestens 3 Zeichen lang sein.";
        }
        break;
      case "email":
        if (!value || !value.includes("@")) {
          return "Bitte geben Sie eine gültige E-Mail-Adresse ein.";
        }
        break;
      case "first_name":
        if (!value) {
          return "Bitte geben Sie einen Vornamen ein.";
        }
        break;
      case "last_name":
        if (!value) {
          return "Bitte geben Sie einen Nachnamen ein.";
        }
        break;
    }
    return null;
  };

  // Debounced Validierung
  React.useEffect(() => {
    const errors: Record<string, string> = {};

    Object.keys(debouncedFormData).forEach((field) => {
      if (field !== "is_staff") {
        const error = validateField(
          field,
          debouncedFormData[field as keyof typeof debouncedFormData] as string,
        );
        if (error) {
          errors[field] = error;
        }
      }
    });

    setValidationErrors(errors);
  }, [debouncedFormData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for this field immediately when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    if (!formData.username || formData.username.length < 3) {
      setError("Benutzername muss mindestens 3 Zeichen lang sein.");
      return false;
    }

    if (!formData.email || !formData.email.includes("@")) {
      setError("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
      return false;
    }

    if (!formData.first_name) {
      setError("Bitte geben Sie einen Vornamen ein.");
      return false;
    }

    if (!formData.last_name) {
      setError("Bitte geben Sie einen Nachnamen ein.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const initialPassword = "forcepassword123";

      await userAdminApi.createUser({
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: initialPassword,
        is_staff: formData.is_staff,
        is_superuser: false,
        is_active: true,
      });

      setSuccess(true);
      setFormData({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        is_staff: false,
      });
      setCopied(false);

      if (onUserCreated) {
        onUserCreated();
      }
    } catch (err: unknown) {
      console.error("Fehler beim Erstellen des Benutzers:", err);
      interface ErrorResponse {
        response?: {
          data?: { [key: string]: string[] | string };
          status?: number;
        };
        message?: string;
      }
      const error = err as ErrorResponse;
      let errorMessage =
        "Benutzer konnte nicht erstellt werden. Bitte versuchen Sie es später erneut.";
      if (error.response?.data) {
        const data = error.response.data;
        const fieldErrors = Object.entries(data)
          .map(([key, value]) => {
            if (key === "password") return null;
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
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard
      .writeText("forcepassword123")
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Fehler beim Kopieren des Passworts: ", err);
      });
  };

  return (
    <div className="">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Neuen Benutzer erstellen
      </h2>

      <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg flex items-start">
        <IoInformationCircleOutline className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-medium">Wichtige Information:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li className="flex items-center">
              <span>
                Das initiale Passwort lautet: <strong>forcepassword123</strong>
              </span>
              <button
                type="button"
                onClick={handleCopyPassword}
                className={clsx(
                  "ml-2 p-1 rounded-md text-xs inline-flex items-center transition-colors",
                  copied
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 hover:bg-blue-200 text-blue-700",
                )}
                title="Passwort kopieren"
              >
                {copied ? (
                  <IoCheckmarkOutline className="h-3 w-3 mr-1" />
                ) : (
                  <IoCopyOutline className="h-3 w-3 mr-1" />
                )}
                {copied ? "Kopiert!" : "Kopieren"}
              </button>
            </li>
            <li>
              Der Benutzer muss sich innerhalb von <strong>60 Minuten</strong>{" "}
              einloggen und das Passwort ändern. Andernfalls wird der Account
              automatisch gelöscht.
            </li>
          </ul>
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md border border-green-200">
          Benutzer erfolgreich erstellt! Bitte informieren Sie den Benutzer über
          das initiale Passwort und die Login-Frist.
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Benutzername *
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dsp-orange focus:border-dsp-orange bg-white"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              E-Mail *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dsp-orange focus:border-dsp-orange bg-white"
              required
            />
          </div>

          <div>
            <label
              htmlFor="first_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Vorname *
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dsp-orange focus:border-dsp-orange bg-white"
              required
            />
          </div>

          <div>
            <label
              htmlFor="last_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nachname *
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-dsp-orange focus:border-dsp-orange bg-white"
              required
            />
          </div>
        </div>

        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-2">
            Benutzerrollen
          </legend>
          <div className="space-y-4">
            <div className="relative flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="is_staff"
                  name="is_staff"
                  type="checkbox"
                  checked={formData.is_staff}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-dsp-orange focus:ring-dsp-orange"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="is_staff" className="font-medium text-gray-700">
                  Staff
                </label>
                <p className="text-gray-500">
                  Ermöglicht Zugriff auf das Admin-Panel (ohne
                  Benutzerverwaltung).
                  <span className="mt-1 flex items-center text-xs text-red-600">
                    <IoWarningOutline className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                    Vorsicht: Nur vertrauenswürdigen Benutzern zuweisen!
                  </span>
                </p>
              </div>
            </div>
          </div>
        </fieldset>

        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Abbrechen
            </button>
          )}
          <ButtonPrimary
            title={loading ? "Wird erstellt..." : "Benutzer erstellen"}
            onClick={() => handleSubmit()}
            disabled={loading}
          />
        </div>
      </form>
    </div>
  );
};

export default CreateUserForm;
