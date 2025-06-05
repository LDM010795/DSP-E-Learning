import React, { useState } from "react";
import { motion } from "framer-motion";
import ButtonPrimary from "../../components/ui_elements/buttons/button_primary";
import ButtonSecondary from "../../components/ui_elements/buttons/button_secondary";
import { IoPersonCircleOutline, IoSaveOutline } from "react-icons/io5";
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
    } catch (err: unknown) {
      console.error("Fehler beim Aktualisieren des Profils:", err);
      const msg =
        err instanceof Error ? err.message : "Ein Fehler ist aufgetreten.";
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
    >
      <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold mb-5 flex items-center gap-2 text-gray-700">
          <IoPersonCircleOutline className="text-dsp-orange" /> Profil
        </h2>

        {errorProfile && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
            {errorProfile}
          </div>
        )}

        {successProfile && (
          <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md border border-green-200">
            Profil erfolgreich aktualisiert!
          </div>
        )}

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
              value={profileData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
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
              value={profileData.fullname}
              onChange={(e) => handleInputChange("fullname", e.target.value)}
              placeholder="Max Mustermann"
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
              value={profileData.email}
              readOnly // Normalerweise nicht änderbar oder über separaten Prozess
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div className="flex justify-end">
            <ButtonPrimary
              title={loadingProfile ? "Speichern..." : "Profil speichern"}
              icon={<IoSaveOutline />}
              onClick={handleProfileSubmit}
              disabled={loadingProfile}
            />
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Profile;
