import React, { useState, useEffect } from "react";
import LogoDSP from "../assets/dsp_no_background.png"; // DSP Logo importieren
import {
  IoClose,
  IoEyeOutline,
  IoEyeOffOutline,
  IoMailOutline,
  IoLockClosedOutline,
} from "react-icons/io5"; // Icons importieren
import ButtonPrimary from "../components/ui_elements/buttons/button_primary";
import MicrosoftLoginButton from "../components/ui_elements/buttons/button_microsoft_login";
import LoadingSpinner from "../components/ui_elements/loading_spinner";
import { useAuth } from "../context/AuthContext.tsx"; // Import useAuth
import { useModules } from "../context/ModuleContext.tsx";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom"; // Import für Navigation

interface LoginPopupProps {
  onClose: () => void;
}

const LoginPopup: React.FC<LoginPopupProps> = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const { login } = useAuth();
  const { fetchModules } = useModules();
  const navigate = useNavigate();

  // Animation beim Mounten
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    // Gespeicherte Anmeldedaten laden
    const savedUsername = localStorage.getItem("rememberedUsername");
    if (savedUsername) {
      setEmail(savedUsername);
      setRememberMe(true);
    }

    return () => clearTimeout(timer);
  }, []);

  const handleLoginSubmit = async () => {
    if (!email || !password) {
      setError("Bitte Benutzername und Passwort eingeben.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const loginResponse = await login({ username: email, password });

      if (loginResponse.success) {
        setLoginSuccess(true);

        // Anmeldedaten merken
        if (rememberMe) {
          localStorage.setItem("rememberedUsername", email);
        } else {
          localStorage.removeItem("rememberedUsername");
        }

        // Prüfe, ob Passwortänderung erforderlich ist
        if (loginResponse.require_password_change) {
          setTimeout(() => {
            navigate("/force-password-change");
            onClose();
          }, 1000);
        } else {
          await fetchModules();
          setTimeout(() => {
            onClose();
            navigate("/dashboard");
          }, 1000);
        }
      } else {
        setError(loginResponse.error || "Login fehlgeschlagen.");
      }
    } catch (err: unknown) {
      console.error("Unerwarteter Fehler während des Login-Prozesses:", err);
      setError("Ein unerwarteter Fehler ist aufgetreten.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setIsClosing(true);
      setIsVisible(false);
      setTimeout(() => {
        onClose();
      }, 200);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ease-out
        ${
          isVisible
            ? "backdrop-blur-xl bg-black/40"
            : "backdrop-blur-none bg-black/0"
        }
        ${isClosing ? "opacity-0" : "opacity-100"}`}
      onClick={handleClose}
    >
      {/* Enhanced Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff863d]/10 via-transparent to-[#ffe7d4]/10"></div>

      <div
        className={`relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-full max-w-5xl mx-4 flex overflow-hidden
          transition-all duration-200 ease-out transform
          ${
            isVisible
              ? "scale-100 translate-y-0 opacity-100"
              : "scale-95 translate-y-8 opacity-0"
          }
          ${isClosing ? "scale-95 -translate-y-8 opacity-0" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Enhanced Left Column */}
        <div
          className={`hidden md:flex flex-col items-center justify-center w-1/2 relative overflow-hidden
          transition-all duration-200 ease-out
          ${
            isVisible
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-[-20px]"
          }
          ${isClosing ? "opacity-0 translate-x-[-20px]" : ""}`}
        >
          {/* Background with gradient and pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-[#ffe7d4]/30"></div>

          {/* Decorative circles mit DSP-Farben */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-[#ff863d]/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-12 w-40 h-40 bg-[#fa8c45]/8 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#ff863d]/5 to-[#ffe7d4]/8 rounded-full blur-3xl"></div>

          <div className="relative z-10 text-center p-12">
            <div
              className={`mb-8 transition-all duration-200 ease-out
                ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
                ${isClosing ? "opacity-0 scale-95" : ""}`}
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-[#ff863d]/20 rounded-2xl blur-xl"></div>
                <img
                  src={LogoDSP}
                  alt="DataSmart Point Logo"
                  className="relative h-20 w-auto object-contain"
                />
              </div>
            </div>

            <h2
              className={`text-3xl font-bold text-gray-700 mb-4 transition-all duration-200 ease-out
              ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }
              ${isClosing ? "opacity-0 translate-y-4" : ""}`}
            >
              Willkommen zurück!
            </h2>

            <p
              className={`text-gray-600 text-lg leading-relaxed transition-all duration-200 ease-out
              ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }
              ${isClosing ? "opacity-0 translate-y-4" : ""}`}
            >
              Melde dich an, um deine Lernreise fortzusetzen und auf alle Kurse
              zuzugreifen.
            </p>

            <div
              className={`mt-8 inline-flex items-center space-x-2 px-4 py-2 bg-[#ff863d]/10 rounded-full border border-[#ff863d]/20 transition-all duration-200 ease-out
              ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }
              ${isClosing ? "opacity-0 translate-y-4" : ""}`}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 font-medium">
                Sicherer Login
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Right Column */}
        <div
          className={`w-full md:w-1/2 bg-white/80 backdrop-blur-sm p-8 md:p-12 
          transition-all duration-200 ease-out
          ${
            isVisible
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-[20px]"
          }
          ${isClosing ? "opacity-0 translate-x-[20px]" : ""}`}
        >
          {/* Enhanced Close Button */}
          <button
            onClick={handleClose}
            disabled={isLoading}
            className={`absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100/80 backdrop-blur-sm hover:bg-gray-200/80 text-gray-400 hover:text-gray-600 transition-all duration-200 ease-in-out flex items-center justify-center group
              ${
                isLoading
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer hover:scale-105"
              }`}
            aria-label="Schließen"
          >
            <IoClose className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
          </button>

          {/* Enhanced Loading Screen */}
          {isLoading && loginSuccess && (
            <div className="flex flex-col items-center justify-center h-full min-h-[500px]">
              <div className="relative">
                <LoadingSpinner
                  message="Login erfolgreich! Weiterleitung zum Dashboard..."
                  size="lg"
                  variant="pulse"
                  showBackground={true}
                />
              </div>
            </div>
          )}

          {/* Enhanced Login Form */}
          {!(isLoading && loginSuccess) && (
            <div className="space-y-6">
              <div className="text-center">
                <h2
                  className={`text-3xl font-bold text-gray-700 mb-3
                  transition-all duration-200 ease-out
                  ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }
                  ${isClosing ? "opacity-0 translate-y-4" : ""}`}
                >
                  Anmelden
                </h2>
                <p
                  className={`text-gray-500 transition-all duration-200 ease-out
                  ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }
                  ${isClosing ? "opacity-0 translate-y-4" : ""}`}
                >
                  Gib deine Anmeldedaten ein, um auf dein Konto zuzugreifen.
                </p>
              </div>

              {/* Enhanced Error Message */}
              {error && (
                <div
                  className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-xl relative transition-all duration-200 shadow-sm"
                  role="alert"
                >
                  <span className="block sm:inline font-medium">{error}</span>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLoginSubmit();
                }}
                className="space-y-5"
              >
                {/* Enhanced Username Input */}
                <div
                  className={`transition-all duration-200 ease-out
                  ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }
                  ${isClosing ? "opacity-0 translate-y-4" : ""}`}
                >
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Benutzername
                  </label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-[#ff863d] transition-colors duration-200">
                      <IoMailOutline className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm bg-white/50 backdrop-blur-sm
                      focus:outline-none focus:ring-2 focus:ring-[#ff863d]/20 focus:border-[#ff863d]
                      transition-all duration-200 ease-in-out
                      hover:border-[#ff863d]/50 hover:shadow-md
                      placeholder:text-gray-400"
                      placeholder="Benutzername eingeben"
                    />
                  </div>
                </div>

                {/* Enhanced Password Input */}
                <div
                  className={`transition-all duration-200 ease-out
                  ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }
                  ${isClosing ? "opacity-0 translate-y-4" : ""}`}
                >
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Passwort
                  </label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-[#ff863d] transition-colors duration-200">
                      <IoLockClosedOutline className="w-5 h-5" />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl shadow-sm bg-white/50 backdrop-blur-sm
                      focus:outline-none focus:ring-2 focus:ring-[#ff863d]/20 focus:border-[#ff863d]
                      transition-all duration-200 ease-in-out
                      hover:border-[#ff863d]/50 hover:shadow-md
                      placeholder:text-gray-400"
                      placeholder="Passwort eingeben"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 
                      text-gray-400 hover:text-[#ff863d] cursor-pointer
                      transition-all duration-200 ease-in-out hover:scale-110"
                      aria-label={
                        showPassword
                          ? "Passwort verbergen"
                          : "Passwort anzeigen"
                      }
                    >
                      {showPassword ? (
                        <IoEyeOffOutline className="w-5 h-5" />
                      ) : (
                        <IoEyeOutline className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Enhanced Remember Me Checkbox */}
                <div
                  className={`transition-all duration-200 ease-out
                  ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }
                  ${isClosing ? "opacity-0 translate-y-4" : ""}`}
                >
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      className="h-4 w-4 text-[#ff863d] focus:ring-[#ff863d]/20 border-gray-300 rounded cursor-pointer transition-all duration-200"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-3 block text-sm text-gray-700 cursor-pointer font-medium"
                    >
                      Anmeldedaten merken
                    </label>
                  </div>
                </div>

                {/* Enhanced Submit Button */}
                <div
                  className={`transition-all duration-200 ease-out
                  ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }
                  ${isClosing ? "opacity-0 translate-y-4" : ""}`}
                >
                  <ButtonPrimary
                    onClick={handleLoginSubmit}
                    title={isLoading ? "Anmelden..." : "Anmelden"}
                    classNameButton={`w-full py-3 shadow-lg shadow-[#ff863d]/25 transform transition-all duration-200 ease-in-out
                    ${
                      isLoading
                        ? "opacity-70 cursor-not-allowed"
                        : "hover:scale-[1.02] hover:shadow-xl hover:shadow-[#ff863d]/30"
                    }`}
                    disabled={isLoading}
                  />
                </div>
              </form>

              {/* Enhanced Divider */}
              <div
                className={`transition-all duration-200 ease-out
                ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }
                ${isClosing ? "opacity-0 translate-y-4" : ""}`}
              >
                <div className="relative flex items-center justify-center my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/80 backdrop-blur-sm text-gray-500 font-medium">
                      oder
                    </span>
                  </div>
                </div>
              </div>

              {/* Enhanced Microsoft Login */}
              <div
                className={`transition-all duration-200 ease-out
                ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }
                ${isClosing ? "opacity-0 translate-y-4" : ""}`}
              >
                <MicrosoftLoginButton
                  disabled={isLoading}
                  onSuccess={() => {
                    setLoginSuccess(true);
                    setIsLoading(true);

                    setTimeout(() => {
                      onClose();
                      navigate("/dashboard");
                    }, 1000);
                  }}
                  onError={(error) => {
                    setError(error);
                    setIsLoading(false);
                    setLoginSuccess(false);
                  }}
                  className="w-full shadow-md hover:shadow-lg transition-shadow duration-200"
                />

                {/* Registration Prompt */}
                <div
                  className={`transition-all duration-200 ease-out
                    ${
                      isVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    }
                    ${isClosing ? "opacity-0 translate-y-4" : ""}`}
                >
                  <div className="text-center mt-6">
                    <span className="text-gray-500">
                      Noch kein Konto?{" "}
                      <Link
                        to="/register"
                        className="text-dsp-orange font-semibold hover:underline"
                        onClick={() => {
                          onClose(); // Optional: closes popup after clicking register
                        }}
                      >
                        Jetzt registrieren
                      </Link>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;
