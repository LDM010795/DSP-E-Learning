import React, { useState } from "react";
import { motion } from "framer-motion";
import ButtonPrimary from "../../components/ui_elements/buttons/button_primary";
import { IoNotificationsOutline, IoSaveOutline } from "react-icons/io5";
import { toast } from "sonner";
import DspNotification from "../../components/toaster/notifications/DspNotification";

interface NotificationSettings {
  emailOnNewContent: boolean;
  weeklyProgress: boolean;
  communityNotifications: boolean;
}

const Notifications: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailOnNewContent: false,
    weeklyProgress: true,
    communityNotifications: false,
  });
  const [loading, setLoading] = useState(false);

  const handleToggle = (setting: keyof NotificationSettings) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.custom((t) => (
        <DspNotification
          id={t}
          type="success"
          title="Einstellungen gespeichert"
          message="Deine Benachrichtigungseinstellungen wurden erfolgreich aktualisiert."
        />
      ));
    } catch {
      toast.custom((t) => (
        <DspNotification
          id={t}
          type="error"
          title="Speichern fehlgeschlagen"
          message="Die Benachrichtigungseinstellungen konnten nicht gespeichert werden."
        />
      ));
    } finally {
      setLoading(false);
    }
  };

  const ToggleSwitch: React.FC<{ active: boolean; onClick: () => void }> = ({
    active,
    onClick,
  }) => (
    <div
      className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors duration-200 ${
        active ? "bg-dsp-orange" : "bg-gray-300"
      }`}
      onClick={onClick}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
          active ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold mb-5 flex items-center gap-2 text-gray-700">
          <IoNotificationsOutline className="text-dsp-orange" />{" "}
          Benachrichtigungen
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-sm font-medium text-gray-700">
                E-Mails bei neuen Kursinhalten
              </span>
              <p className="text-xs text-gray-500 mt-1">
                Erhalte Benachrichtigungen wenn neue Module oder Aufgaben
                verfügbar sind
              </p>
            </div>
            <ToggleSwitch
              active={settings.emailOnNewContent}
              onClick={() => handleToggle("emailOnNewContent")}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-sm font-medium text-gray-700">
                Wöchentliche Fortschrittsberichte
              </span>
              <p className="text-xs text-gray-500 mt-1">
                Erhalte eine wöchentliche Zusammenfassung deines
                Lernfortschritts
              </p>
            </div>
            <ToggleSwitch
              active={settings.weeklyProgress}
              onClick={() => handleToggle("weeklyProgress")}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-sm font-medium text-gray-700">
                Community-Benachrichtigungen
              </span>
              <p className="text-xs text-gray-500 mt-1">
                Benachrichtigungen über Forum-Aktivitäten und Community-Updates
              </p>
            </div>
            <ToggleSwitch
              active={settings.communityNotifications}
              onClick={() => handleToggle("communityNotifications")}
            />
          </div>

          <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
            <ButtonPrimary
              title={loading ? "Speichern..." : "Benachrichtigungen speichern"}
              icon={<IoSaveOutline />}
              onClick={handleSave}
              disabled={loading}
            />
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Notifications;
