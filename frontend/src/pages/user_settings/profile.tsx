import React, { useState } from "react";
import { motion } from "framer-motion";
import ButtonPrimary from "../../components/ui_elements/buttons/button_primary";
import ButtonSecondary from "../../components/ui_elements/buttons/button_secondary";
import SubBackground from "../../components/layouts/SubBackground";
import {
  IoPersonCircleOutline,
  IoSaveOutline,
  IoCameraOutline,
} from "react-icons/io5";
import { toast } from "sonner";
import DspNotification from "../../components/toaster/notifications/DspNotification";

const Profile: React.FC = () => {
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [errorProfile, setErrorProfile] = useState<string | null>(null);
  const [successProfile, setSuccessProfile] = useState(false);

  // Profile data state
  const [profileData, setProfileData] = useState({
    username: "MaxMustermann",
    fullname: "",
    email: "max.mustermann@example.com",
  });

  // Mock API function - replace with actual API call
  const updateProfile = async (): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return Math.random() > 0.2; // 80% success rate for demo
  };

  const handleProfileSubmit = async () => {
    setLoadingProfile(true);
    setErrorProfile(null);
    setSuccessProfile(false);

    try {
      const success = await updateProfile();
      if (success) {
        setSuccessProfile(true);
        toast.custom((t) => (
          <DspNotification
            id={t}
            type="success"
            title="Profil gespeichert"
            message="Deine Profilinformationen wurden erfolgreich aktualisiert."
          />
        ));
      } else {
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
    } catch (err: unknown) {
      console.error("Fehler beim Aktualisieren des Profils:", err);
      const msg =
        err instanceof Error ? err.message : "Ein Fehler ist aufgetreten.";
      setErrorProfile(msg);
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

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <SubBackground className="hover:bg-white/80 transition-all duration-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-xl bg-dsp-orange_light">
            <IoPersonCircleOutline className="w-6 h-6 text-dsp-orange" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Profil bearbeiten
            </h2>
            <p className="text-sm text-gray-600">
              Verwalte deine persönlichen Informationen
            </p>
          </div>
        </div>

        {errorProfile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200"
          >
            {errorProfile}
          </motion.div>
        )}

        {successProfile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200"
          >
            Profil erfolgreich aktualisiert!
          </motion.div>
        )}

        <div className="space-y-6">
          {/* Avatar Section */}
          <motion.div
            className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative group">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-gray-400 group-hover:from-dsp-orange_light group-hover:to-dsp-orange_light transition-all duration-200">
                <IoPersonCircleOutline className="w-12 h-12" />
              </div>
              <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <IoCameraOutline className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <ButtonSecondary
                title="Profilbild ändern"
                onClick={() => {}}
                icon={<IoCameraOutline className="w-4 h-4" />}
                iconPosition="left"
                classNameButton="text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">
                JPG, PNG oder SVG. Max. 5MB.
              </p>
            </div>
          </motion.div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Benutzername
              </label>
              <input
                type="text"
                id="username"
                value={profileData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-dsp-orange/20 focus:border-dsp-orange transition-all duration-200 bg-white/60 backdrop-blur-sm"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label
                htmlFor="fullname"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Vollständiger Name
              </label>
              <input
                type="text"
                id="fullname"
                value={profileData.fullname}
                onChange={(e) => handleInputChange("fullname", e.target.value)}
                placeholder="Max Mustermann"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-dsp-orange/20 focus:border-dsp-orange transition-all duration-200 bg-white/60 backdrop-blur-sm"
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              E-Mail Adresse
            </label>
            <input
              type="email"
              id="email"
              value={profileData.email}
              readOnly
              className="w-full p-3 border border-gray-300 rounded-xl bg-gray-100/60 backdrop-blur-sm cursor-not-allowed text-gray-600"
            />
            <p className="text-xs text-gray-500 mt-2">
              Kontaktiere den Support um deine E-Mail-Adresse zu ändern
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <ButtonSecondary
              title="Abbrechen"
              onClick={() => {
                setProfileData({
                  username: "MaxMustermann",
                  fullname: "",
                  email: "max.mustermann@example.com",
                });
              }}
              classNameButton="w-full sm:w-auto"
            />
            <ButtonPrimary
              title={loadingProfile ? "Speichern..." : "Profil speichern"}
              icon={<IoSaveOutline className="w-4 h-4" />}
              onClick={handleProfileSubmit}
              disabled={loadingProfile}
              classNameButton="w-full sm:w-auto"
            />
          </motion.div>
        </div>
      </SubBackground>
    </motion.div>
  );
};

export default Profile;
