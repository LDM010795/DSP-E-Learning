import React, { useState } from "react";
import { motion } from "framer-motion";
import ButtonPrimary from "../../components/ui_elements/buttons/button_primary";
import { IoColorPaletteOutline, IoSaveOutline } from "react-icons/io5";
import { toast } from "sonner";
import DspNotification from "../../components/toaster/notifications/DspNotification";

type ThemeMode = "light" | "dark" | "system";
type ColorScheme = "orange" | "blue" | "green" | "purple";

interface DesignSettings {
  theme: ThemeMode;
  colorScheme: ColorScheme;
}

const Design: React.FC = () => {
  const [settings, setSettings] = useState<DesignSettings>({
    theme: "light",
    colorScheme: "orange",
  });
  const [loading, setLoading] = useState(false);

  const handleThemeChange = (theme: ThemeMode) => {
    setSettings((prev) => ({
      ...prev,
      theme,
    }));
  };

  const handleColorSchemeChange = (colorScheme: ColorScheme) => {
    setSettings((prev) => ({
      ...prev,
      colorScheme,
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
          title="Design gespeichert"
          message="Deine Design-Einstellungen wurden erfolgreich aktualisiert."
        />
      ));
    } catch {
      toast.custom((t) => (
        <DspNotification
          id={t}
          type="error"
          title="Speichern fehlgeschlagen"
          message="Die Design-Einstellungen konnten nicht gespeichert werden."
        />
      ));
    } finally {
      setLoading(false);
    }
  };

  const colorOptions: { name: ColorScheme; color: string; label: string }[] = [
    { name: "orange", color: "bg-dsp-orange", label: "Orange (Standard)" },
    { name: "blue", color: "bg-blue-500", label: "Blau" },
    { name: "green", color: "bg-green-500", label: "Grün" },
    { name: "purple", color: "bg-purple-500", label: "Lila" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
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
              <div
                className={`border rounded-lg p-4 text-center cursor-pointer transition-colors duration-200 ${
                  settings.theme === "light"
                    ? "border-dsp-orange bg-orange-50"
                    : "border-gray-300 hover:border-dsp-orange"
                }`}
                onClick={() => handleThemeChange("light")}
              >
                <div className="h-24 bg-white border border-gray-200 rounded mb-2"></div>
                <span className="text-sm font-medium">Hell</span>
                {settings.theme === "light" && (
                  <div className="mt-1 w-2 h-2 bg-dsp-orange rounded-full mx-auto"></div>
                )}
              </div>
              <div
                className={`border rounded-lg p-4 text-center cursor-pointer transition-colors duration-200 ${
                  settings.theme === "dark"
                    ? "border-dsp-orange bg-orange-50"
                    : "border-gray-300 hover:border-dsp-orange"
                }`}
                onClick={() => handleThemeChange("dark")}
              >
                <div className="h-24 bg-gray-900 border border-gray-700 rounded mb-2"></div>
                <span className="text-sm font-medium">Dunkel</span>
                {settings.theme === "dark" && (
                  <div className="mt-1 w-2 h-2 bg-dsp-orange rounded-full mx-auto"></div>
                )}
              </div>
              <div
                className={`border rounded-lg p-4 text-center cursor-pointer transition-colors duration-200 ${
                  settings.theme === "system"
                    ? "border-dsp-orange bg-orange-50"
                    : "border-gray-300 hover:border-dsp-orange"
                }`}
                onClick={() => handleThemeChange("system")}
              >
                <div className="h-24 bg-gradient-to-b from-white to-gray-900 border border-gray-400 rounded mb-2"></div>
                <span className="text-sm font-medium">System</span>
                {settings.theme === "system" && (
                  <div className="mt-1 w-2 h-2 bg-dsp-orange rounded-full mx-auto"></div>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4 text-gray-800">
              Farbschema
            </h3>
            <div className="space-y-3">
              {colorOptions.map((option) => (
                <div
                  key={option.name}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors duration-200 ${
                    settings.colorScheme === option.name
                      ? "border-dsp-orange bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleColorSchemeChange(option.name)}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-6 h-6 rounded-full ${option.color} border-2 border-white shadow-sm`}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">
                      {option.label}
                    </span>
                  </div>
                  {settings.colorScheme === option.name && (
                    <div className="w-2 h-2 bg-dsp-orange rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <ButtonPrimary
              title={loading ? "Speichern..." : "Design speichern"}
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

export default Design;
