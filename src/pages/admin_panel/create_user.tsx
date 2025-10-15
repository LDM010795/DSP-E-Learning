import React from "react";
import { motion } from "framer-motion";
import CreateUserForm from "../../components/ui_elements/forms/create_user_form";
import { useAuth } from "../../context/AuthContext";

interface CreateUserProps {
  onUserCreated?: () => void;
}

const CreateUser: React.FC<CreateUserProps> = ({ onUserCreated }) => {
  const { user } = useAuth();

  // Nur für Superuser zugänglich
  if (!user?.is_superuser) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          Zugriff verweigert. Nur Administratoren können Benutzer erstellen.
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <CreateUserForm onUserCreated={onUserCreated} />
    </motion.div>
  );
};

export default CreateUser;
