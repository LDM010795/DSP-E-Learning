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
import { useAuth } from "../context/AuthContext.tsx"; // Import useAuth
import { useModules } from "../context/ModuleContext.tsx";
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

  const { login } = useAuth();
  const { fetchModules } = useModules();
  const navigate = useNavigate();

  // Animation beim Mounten
  useEffect(() => {
    // Kurze Verzögerung für besseren visuellen Effekt
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    // Gespeicherte Anmeldedaten laden, falls vorhanden
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

      // DEBUG: Logge die Antwort vom AuthContext
      console.log("Login Response from AuthContext:", loginResponse);

      if (loginResponse.success) {
        console.log("Login erfolgreich, AuthContext aktualisiert.");

        // Anmeldedaten merken
        if (rememberMe) {
          localStorage.setItem("rememberedUsername", email);
        } else {
          localStorage.removeItem("rememberedUsername");
        }

        // Prüfe, ob Passwortänderung erforderlich ist
        if (loginResponse.require_password_change) {
          console.log("Passwortänderung erforderlich, leite weiter...");
          navigate("/force-password-change");
          onClose(); // Schließe das Login-Popup
        } else {
          console.log(
            "Keine Passwortänderung erforderlich, lade Module und gehe zum Dashboard."
          );
          await fetchModules(); // Module nach erfolgreichem Login laden
          onClose(); // Schließe das Login-Popup
          navigate("/dashboard");
        }
      } else {
        // Fehlermeldung aus der login Funktion verwenden
        setError(loginResponse.error || "Login fehlgeschlagen.");
      }
    } catch (err: unknown) {
      // Dieser Catch-Block sollte jetzt seltener getroffen werden,
      // da Fehler idealerweise in der login-Funktion behandelt werden.
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
      // Verzögerung für die Ausblend-Animation
      setTimeout(() => {
        onClose();
      }, 300);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-in-out
        ${
          isVisible
            ? "backdrop-blur-sm bg-black/30"
            : "backdrop-blur-none bg-black/0"
        }
        ${isClosing ? "opacity-0" : "opacity-100"}`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full max-w-4xl flex overflow-hidden relative
          transition-all duration-300 ease-out transform
          ${
            isVisible
              ? "scale-100 translate-y-0 opacity-100"
              : "scale-95 translate-y-4 opacity-0"
          }
          ${isClosing ? "scale-95 -translate-y-4 opacity-0" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Linke Spalte mit verfeinerter Animation */}
        <div
          className={`hidden md:flex flex-col items-center justify-center w-1/2 
          bg-gradient-to-br from-gray-100 to-gray-200 p-12 text-center
          transition-all duration-300 ease-out
          ${
            isVisible
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-[-10%]"
          }
          ${isClosing ? "opacity-0 translate-x-[-10%]" : ""}`}
        >
          <img
            src={LogoDSP}
            alt="DataSmart Point Logo"
            className={`h-20 mb-6 transition-all duration-300 ease-out
              ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
              ${isClosing ? "opacity-0 scale-95" : ""}`}
          />
          <h2
            className={`text-3xl font-bold text-gray-800 mb-3 transition-all duration-300 delay-100
            ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            }
            ${isClosing ? "opacity-0 translate-y-2" : ""}`}
          >
            Willkommen zurück!
          </h2>
          <p
            className={`text-gray-600 transition-all duration-300 delay-150
            ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            }
            ${isClosing ? "opacity-0 translate-y-2" : ""}`}
          >
            Melde dich an, um deine Lernreise fortzusetzen und auf alle Kurse
            zuzugreifen.
          </p>
        </div>

        {/* Rechte Spalte mit angepassten Animationen */}
        <div
          className={`w-full md:w-1/2 bg-white p-8 md:p-12 
          transition-all duration-300 ease-out
          ${
            isVisible
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-[10%]"
          }
          ${isClosing ? "opacity-0 translate-x-[10%]" : ""}`}
        >
          {/* Schließen-Button mit subtilerer Animation */}
          <button
            onClick={handleClose}
            disabled={isLoading}
            className={`absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl z-10
              transition-all duration-200 ease-in-out hover:scale-105
              ${
                isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              }`}
            aria-label="Schließen"
          >
            <IoClose />
          </button>

          <div className="space-y-4">
            <h2
              className={`text-2xl font-semibold text-gray-800 text-center
              transition-all duration-300 ease-out
              ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2"
              }
              ${isClosing ? "opacity-0 translate-y-2" : ""}`}
            >
              Anmelden
            </h2>
            <p
              className={`text-sm text-gray-500 text-center
              transition-all duration-300 ease-out
              ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2"
              }
              ${isClosing ? "opacity-0 translate-y-2" : ""}`}
            >
              Gib deine Anmeldedaten ein, um auf dein Konto zuzugreifen.
            </p>

            {/* Error Message mit subtilerer Animation */}
            {error && (
              <div
                className={`bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative
                  transition-all duration-300`}
                role="alert"
              >
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLoginSubmit();
              }}
              className="space-y-4"
            >
              {/* Benutzername Input mit angepasster Animation */}
              <div
                className={`transition-all duration-300 ease-out
                ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2"
                }
                ${isClosing ? "opacity-0 translate-y-2" : ""}`}
              >
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Benutzername
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <IoMailOutline />
                  </span>
                  <input
                    type="text"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm
                      focus:outline-none focus:ring-1 focus:ring-dsp-orange focus:border-dsp-orange
                      transition-all duration-200 ease-in-out
                      hover:border-dsp-orange cursor-pointer"
                    placeholder="Benutzername"
                  />
                </div>
              </div>

              {/* Passwort Input mit angepasster Animation */}
              <div
                className={`transition-all duration-300 ease-out
                ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2"
                }
                ${isClosing ? "opacity-0 translate-y-2" : ""}`}
              >
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Passwort
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <IoLockClosedOutline />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm
                      focus:outline-none focus:ring-1 focus:ring-dsp-orange focus:border-dsp-orange
                      transition-all duration-200 ease-in-out
                      hover:border-dsp-orange cursor-pointer"
                    placeholder="********"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 
                      text-gray-400 hover:text-gray-600 cursor-pointer
                      transition-all duration-200 ease-in-out hover:scale-105"
                    aria-label={
                      showPassword ? "Passwort verbergen" : "Passwort anzeigen"
                    }
                  >
                    {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                  </button>
                </div>
              </div>

              {/* Anmeldedaten merken Checkbox */}
              <div
                className={`transition-all duration-300 ease-out
                ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2"
                }
                ${isClosing ? "opacity-0 translate-y-2" : ""}`}
              >
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="h-4 w-4 text-dsp-orange focus:ring-dsp-orange border-gray-300 rounded cursor-pointer"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700 cursor-pointer"
                  >
                    Anmeldedaten merken
                  </label>
                </div>
              </div>

              {/* Submit Button mit angepasster Animation */}
              <div
                className={`transition-all duration-300 ease-out
                ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2"
                }
                ${isClosing ? "opacity-0 translate-y-2" : ""}`}
              >
                <ButtonPrimary
                  onClick={handleLoginSubmit}
                  title={isLoading ? "Anmelden..." : "Anmelden"}
                  classNameButton={`w-full transform transition-all duration-200 ease-in-out
                    ${
                      isLoading
                        ? "opacity-70 cursor-not-allowed"
                        : "hover:scale-[1.01]"
                    }`}
                  disabled={isLoading}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;
