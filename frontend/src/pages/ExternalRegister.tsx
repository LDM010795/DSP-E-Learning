import React, { useState } from "react";
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

const API_URL = process.env.REACT_APP_API_URL || "";

const ExternalRegister: React.FC = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password_confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [k: string]: string }>({});
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({});
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});
    setSuccessMsg(null);

    try {
      const response = await fetch(`${API_URL}/api/external-register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(
          "Registrierung erfolgreich! Du kannst dich jetzt anmelden.",
        );
        setTimeout(() => navigate("/login"), 2000);
      } else {
        if (typeof data === "object") {
          setFieldErrors(data);
          setError("Bitte korrigiere die markierten Fehler");
        } else {
          setError("Registrierung fehlgeschlagen. Bitte versuche es erneut.");
        }
      }
    } catch {
      setError("Verbindungsfehler. Bitte versuche es erneut");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#ffe7d4]/40 to-white px-4">
      <div className="max-w-md w-full bg-white/95 shadow-xl rounded-2xl p-8 space-y-6 border border-white/20">
        <div className="flex flex-col items-center space-y-2 mb-4">
          <img src={LogoDSP} alt="DSP Logo" className="h-14 mb-2" />
          <h1 className="text-3xl font-bold text-gray-800">Registrieren</h1>
          <p className="text-gray-600 text-center text-base">
            Erstelle einen Account als externer Nutzer.
          </p>
        </div>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label
              className="block text-sm font-semibold mb-1"
              htmlFor="username"
            >
              Benutzername
            </label>
            <div className="relative">
              <IoPersonOutline className="absolute left-3 top-3 text-gray-400" />
              <input
                id="username"
                name="username"
                type="text"
                className={`w-full pl-10 pr-3 py-2 border rounded-xl shadow-sm bg-white/60 focus:ring-2 focus:border-orange-400 ${fieldErrors.username ? "border-red-400" : "border-gray-200"}`}
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
              <IoMailOutline className="absolute left-3 top-3 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                className={`w-full pl-10 pr-3 py-2 border rounded-xl shadow-sm bg-white/60 focus:ring-2 focus:border-orange-400 ${fieldErrors.email ? "border-red-400" : "border-gray-200"}`}
                placeholder="E-Mail-Adresse"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            {fieldErrors.email && (
              <div className="text-sm text-red-500">{fieldErrors.email}</div>
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
              className={`w-full px-3 py-2 border rounded-xl shadow-sm bg-white/60 focus:ring-2 focus:border-orange-400 ${fieldErrors.first_name ? "border-red-400" : "border-gray-200"}`}
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
              className={`w-full px-3 py-2 border rounded-xl shadow-sm bg-white/60 focus:ring-2 focus:border-orange-400 ${fieldErrors.last_name ? "border-red-400" : "border-gray-200"}`}
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
              <IoLockClosedOutline className="absolute left-3 top-3 text-gray-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className={`w-full pl-10 pr-10 py-2 border rounded-xl shadow-sm bg-white/60 focus:ring-2 focus:border-orange-400 ${fieldErrors.password ? "border-red-400" : "border-gray-200"}`}
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
              <IoLockClosedOutline className="absolute left-3 top-3 text-gray-400" />
              <input
                id="password_confirm"
                name="password_confirm"
                type={showPassword ? "text" : "password"}
                className={`w-full pl-10 pr-10 py-2 border rounded-xl shadow-sm bg-white/60 focus:ring-2 focus:border-orange-400 ${fieldErrors.password_confirm ? "border-red-400" : "border-gray-200"}`}
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
              >
                {showPassword ? (
                  <IoEyeOffOutline className="w-5 h-5" />
                ) : (
                  <IoEyeOutline className="w-5 h-5" />
                )}
              </button>
            </div>
            {fieldErrors.password_confirm && (
              <div className="text-sm text-red-500">
                {fieldErrors.password_confirm}
              </div>
            )}
          </div>
          <div>
            <ButtonPrimary
              type="submit"
              title={loading ? "Registriere..." : "Registrieren"}
              disabled={loading}
              classNameButton="w-full"
              onClick={() => {}}
            />
          </div>
        </form>
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
