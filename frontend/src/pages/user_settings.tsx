import React, { useState, useRef, useEffect } from "react";
import Breadcrumbs from "../components/ui_elements/breadcrumbs";
import ButtonPrimary from "../components/ui_elements/buttons/button_primary";
import ButtonSecondary from "../components/ui_elements/buttons/button_secondary";
import {
  IoPersonCircleOutline,
  IoLockClosedOutline,
  IoNotificationsOutline,
  IoTrashOutline,
  IoSaveOutline,
  IoColorPaletteOutline,
} from "react-icons/io5";
import { toast } from "sonner";
import DspNotification from "../components/toaster/notifications/DspNotification";

type TabState = "profil" | "konto" | "benachrichtigungen" | "design";

function UserSettings() {
  const [activeTab, setActiveTab] = useState<TabState>("profil");
  const [sliderStyle, setSliderStyle] = useState({});
  const tabsRef = useRef<HTMLDivElement>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [errorProfile, setErrorProfile] = useState<string | null>(null);
  const [successProfile, setSuccessProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [successPassword, setSuccessPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // --- Breadcrumb Items ---
  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Einstellungen" }, // Aktuelle Seite
  ];

  useEffect(() => {
    const container = tabsRef.current;
    if (!container) return;

    const activeButton = container.querySelector<HTMLButtonElement>(
      `[data-tab="${activeTab}"]`
    );
    if (activeButton) {
      setSliderStyle({
        left: activeButton.offsetLeft,
        width: activeButton.offsetWidth,
      });
    }
  }, [activeTab]);

  const renderTabs = () => (
    <div
      ref={tabsRef}
      className="relative flex space-x-1 border border-gray-300 p-1 rounded-lg bg-gray-100 mb-8 self-start"
    >
      <div
        className="absolute inset-y-0 bg-dsp-orange rounded-md shadow-sm transition-all duration-300 ease-out pointer-events-none"
        style={sliderStyle}
      />
      {(["profil", "konto", "benachrichtigungen", "design"] as TabState[]).map(
        (tab) => (
          <button
            key={tab}
            data-tab={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative z-10 px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer 
            ${
              activeTab === tab
                ? "text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        )
      )}
    </div>
  );

  const renderProfil = () => (
    <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-xl font-semibold mb-5 flex items-center gap-2 text-gray-700">
        <IoPersonCircleOutline className="text-dsp-orange" /> Profil
      </h2>
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          {/* Platzhalter für Avatar */}
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
            <IoPersonCircleOutline size={40} />
          </div>
          <ButtonSecondary title="Bild ändern" onClick={() => {}} />
        </div>
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Benutzername
          </label>
          <input
            type="text"
            id="username"
            defaultValue="MaxMustermann" // Platzhalter Wert
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-dsp-orange focus:border-dsp-orange"
          />
        </div>
        <div>
          <label
            htmlFor="fullname"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Vollständiger Name
          </label>
          <input
            type="text"
            id="fullname"
            placeholder="Max Mustermann" // Platzhalter
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-dsp-orange focus:border-dsp-orange"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            E-Mail Adresse
          </label>
          <input
            type="email"
            id="email"
            defaultValue="max.mustermann@example.com" // Platzhalter Wert
            readOnly // Normalerweise nicht änderbar oder über separaten Prozess
            className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
          />
        </div>
        <div className="flex justify-end">
          <ButtonPrimary
            title="Profil speichern"
            icon={<IoSaveOutline />}
            onClick={handleProfileSubmit}
          />
        </div>
      </div>
    </section>
  );

  const renderKonto = () => (
    <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-xl font-semibold mb-5 flex items-center gap-2 text-gray-700">
        <IoLockClosedOutline className="text-dsp-orange" /> Konto
      </h2>
      <div className="space-y-6">
        {/* Passwort ändern */}
        <div>
          <h3 className="text-lg font-medium mb-2 text-gray-800">
            Passwort ändern
          </h3>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Aktuelles Passwort
              </label>
              <input
                type="password"
                id="currentPassword"
                placeholder="••••••••"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-dsp-orange focus:border-dsp-orange"
              />
            </div>
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Neues Passwort
              </label>
              <input
                type="password"
                id="newPassword"
                placeholder="••••••••"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-dsp-orange focus:border-dsp-orange"
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Neues Passwort bestätigen
              </label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="••••••••"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-dsp-orange focus:border-dsp-orange"
              />
            </div>
            <div className="flex justify-end">
              <ButtonPrimary
                title="Passwort speichern"
                icon={<IoSaveOutline />}
                onClick={handlePasswordSubmit}
              />
            </div>
          </div>
        </div>

        {/* Konto löschen */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium mb-2 text-red-600">
            Konto löschen
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Achtung: Diese Aktion kann nicht rückgängig gemacht werden. Alle
            deine Daten und Fortschritte gehen verloren.
          </p>
          <ButtonSecondary
            title="Konto unwiderruflich löschen"
            icon={<IoTrashOutline />}
            onClick={() => {}}
            classNameButton="text-red-600 border-red-500 hover:bg-red-50"
            classNameIcon="text-red-500"
          />
        </div>
      </div>
    </section>
  );

  const renderBenachrichtigungen = () => (
    <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-xl font-semibold mb-5 flex items-center gap-2 text-gray-700">
        <IoNotificationsOutline className="text-dsp-orange" />{" "}
        Benachrichtigungen
      </h2>
      <div className="space-y-3">
        {/* Platzhalter für Toggle Switches */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            E-Mails bei neuen Kursinhalten
          </span>
          <div className="w-10 h-5 bg-gray-300 rounded-full p-0.5 cursor-pointer">
            {/* Placeholder Toggle */}
            <div className="w-4 h-4 bg-white rounded-full shadow-md transform translate-x-0 transition-transform"></div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Wöchentliche Fortschrittsberichte
          </span>
          <div className="w-10 h-5 bg-dsp-orange rounded-full p-0.5 cursor-pointer">
            {/* Placeholder Toggle (aktiv) */}
            <div className="w-4 h-4 bg-white rounded-full shadow-md transform translate-x-5 transition-transform"></div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Community-Benachrichtigungen (Forum etc.)
          </span>
          <div className="w-10 h-5 bg-gray-300 rounded-full p-0.5 cursor-pointer">
            {/* Placeholder Toggle */}
            <div className="w-4 h-4 bg-white rounded-full shadow-md transform translate-x-0 transition-transform"></div>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <ButtonPrimary
            title="Benachrichtigungen speichern"
            icon={<IoSaveOutline />}
            onClick={() => {}}
          />
        </div>
      </div>
    </section>
  );

  const renderDesign = () => (
    <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-xl font-semibold mb-5 flex items-center gap-2 text-gray-700">
        <IoColorPaletteOutline className="text-dsp-orange" />{" "}
        Design-Einstellungen
      </h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4 text-gray-800">
            Erscheinungsbild
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-dsp-orange">
              <div className="h-24 bg-white border border-gray-200 rounded mb-2"></div>
              <span className="text-sm font-medium">Hell</span>
            </div>
            <div className="border border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-dsp-orange">
              <div className="h-24 bg-gray-900 border border-gray-700 rounded mb-2"></div>
              <span className="text-sm font-medium">Dunkel</span>
            </div>
            <div className="border border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-dsp-orange">
              <div className="h-24 bg-gradient-to-b from-white to-gray-900 border border-gray-400 rounded mb-2"></div>
              <span className="text-sm font-medium">System</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2 text-gray-800">Farbschema</h3>
          <div className="flex gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-dsp-orange border-2 border-white shadow-sm cursor-pointer"></div>
            <div className="w-10 h-10 rounded-full bg-blue-500 border-2 border-white shadow-sm cursor-pointer"></div>
            <div className="w-10 h-10 rounded-full bg-green-500 border-2 border-white shadow-sm cursor-pointer"></div>
            <div className="w-10 h-10 rounded-full bg-purple-500 border-2 border-white shadow-sm cursor-pointer"></div>
          </div>
        </div>

        <div className="flex justify-end">
          <ButtonPrimary
            title="Design speichern"
            icon={<IoSaveOutline />}
            onClick={() => {}}
          />
        </div>
      </div>
    </section>
  );

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... (Validierung etc.)
    setLoadingProfile(true);
    setErrorProfile(null);

    try {
      const success = await updateProfile(profileData);
      if (success) {
        // ERFOLG-TOAST
        toast.custom((t) => (
          <DspNotification
            id={t}
            type="success"
            title="Profil gespeichert"
            message="Deine Profilinformationen wurden erfolgreich aktualisiert."
          />
        ));
      } else {
        // FEHLER-TOAST (wenn API false zurückgibt)
        setErrorProfile("Profil konnte nicht aktualisiert werden.");
        toast.custom((t) => (
          <DspNotification
            id={t}
            type="error"
            title="Speichern fehlgeschlagen"
            message="Deine Profilinformationen konnten nicht gespeichert werden."
          />
        ));
      }
    } catch (err: any) {
      console.error("Fehler beim Aktualisieren des Profils:", err);
      const msg =
        err.response?.data?.detail ||
        err.message ||
        "Ein Fehler ist aufgetreten.";
      setErrorProfile(msg);
      // FEHLER-TOAST (Exception)
      toast.custom((t) => (
        <DspNotification
          id={t}
          type="error"
          title="Speichern fehlgeschlagen"
          message={`Fehler: ${msg}`}
        />
      ));
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... (Passwort-Validierung)

    setLoadingPassword(true);
    setErrorPassword(null);
    setSuccessPassword(false);

    try {
      const success = await changePassword(
        passwordData.current_password,
        passwordData.new_password
      );
      if (success) {
        setSuccessPassword(true);
        setPasswordData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
        // ERFOLG-TOAST
        toast.custom((t) => (
          <DspNotification
            id={t}
            type="success"
            title="Passwort geändert"
            message="Dein Passwort wurde erfolgreich aktualisiert."
          />
        ));
      } else {
        // FEHLER-TOAST (wenn API false zurückgibt)
        setErrorPassword("Passwort konnte nicht geändert werden.");
        toast.custom((t) => (
          <DspNotification
            id={t}
            type="error"
            title="Änderung fehlgeschlagen"
            message="Das Passwort konnte nicht geändert werden. Überprüfe dein aktuelles Passwort."
          />
        ));
      }
    } catch (err: any) {
      console.error("Fehler beim Ändern des Passworts:", err);
      const msg =
        err.response?.data?.detail ||
        err.message ||
        "Ein Fehler ist aufgetreten.";
      setErrorPassword(msg);
      // FEHLER-TOAST (Exception)
      toast.custom((t) => (
        <DspNotification
          id={t}
          type="error"
          title="Änderung fehlgeschlagen"
          message={`Fehler: ${msg}`}
        />
      ));
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="p-6">
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />

      {/* Gruppiere Titel und Untertitel und setze Abstand nach unten */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Benutzereinstellungen
        </h1>
        <p className="text-base text-gray-600 mt-1">
          Verwalte und personalisiere dein Konto nach deinen Wünschen.
        </p>
      </div>

      {renderTabs()}

      <div className="mt-6">
        {activeTab === "profil" && renderProfil()}
        {activeTab === "konto" && renderKonto()}
        {activeTab === "benachrichtigungen" && renderBenachrichtigungen()}
        {activeTab === "design" && renderDesign()}
      </div>
    </div>
  );
}

export default UserSettings;
