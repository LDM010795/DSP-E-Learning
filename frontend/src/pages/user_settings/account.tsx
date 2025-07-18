import React, { useState } from "react";
import { motion } from "framer-motion";
import ButtonPrimary from "../../components/ui_elements/buttons/button_primary";
import ButtonSecondary from "../../components/ui_elements/buttons/button_secondary";
import {
  IoLockClosedOutline,
  IoTrashOutline,
  IoSaveOutline,
} from "react-icons/io5";
import { toast } from "sonner";
import DspNotification from "../../components/toaster/notifications/DspNotification";

const Account: React.FC = () => {
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [successPassword, setSuccessPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Mock API function - replace with actual API call
  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> => {
    // Simulate API call with parameter validation
    console.log("Changing password for validation:", {
      currentPassword: "***",
      newPassword: "***",
    });

    // Basic validation simulation
    if (!currentPassword || !newPassword) {
      return false;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    return Math.random() > 0.3; // 70% success rate for demo
  };

  const handlePasswordSubmit = async () => {
    // Validation
    if (
      !passwordData.current_password ||
      !passwordData.new_password ||
      !passwordData.confirm_password
    ) {
      setErrorPassword("Bitte fülle alle Felder aus.");
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setErrorPassword("Die neuen Passwörter stimmen nicht überein.");
      return;
    }

    if (passwordData.new_password.length < 8) {
      setErrorPassword(
        "Das neue Passwort muss mindestens 8 Zeichen lang sein.",
      );
      return;
    }

    setLoadingPassword(true);
    setErrorPassword(null);
    setSuccessPassword(false);

    try {
      const success = await changePassword(
        passwordData.current_password,
        passwordData.new_password,
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
    } catch (err: unknown) {
      console.error("Fehler beim Ändern des Passworts:", err);
      const msg =
        err instanceof Error ? err.message : "Ein Fehler ist aufgetreten.";
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

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion with confirmation modal
    toast.custom((t) => (
      <DspNotification
        id={t}
        type="warning"
        title="Funktion noch nicht verfügbar"
        message="Die Konto-Löschung ist noch nicht implementiert."
      />
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
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

            {errorPassword && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                {errorPassword}
              </div>
            )}

            {successPassword && (
              <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md border border-green-200">
                Passwort erfolgreich geändert!
              </div>
            )}

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
                  value={passwordData.current_password}
                  onChange={(e) =>
                    handlePasswordInputChange(
                      "current_password",
                      e.target.value,
                    )
                  }
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
                  value={passwordData.new_password}
                  onChange={(e) =>
                    handlePasswordInputChange("new_password", e.target.value)
                  }
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
                  value={passwordData.confirm_password}
                  onChange={(e) =>
                    handlePasswordInputChange(
                      "confirm_password",
                      e.target.value,
                    )
                  }
                  placeholder="••••••••"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-dsp-orange focus:border-dsp-orange"
                />
              </div>
              <div className="flex justify-end">
                <ButtonPrimary
                  title={
                    loadingPassword ? "Speichern..." : "Passwort speichern"
                  }
                  icon={<IoSaveOutline />}
                  onClick={handlePasswordSubmit}
                  disabled={loadingPassword}
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
              onClick={handleDeleteAccount}
              classNameButton="text-red-600 border-red-500 hover:bg-red-50"
              classNameIcon="text-red-500"
            />
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Account;
