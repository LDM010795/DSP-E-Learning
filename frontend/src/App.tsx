import React, { useState } from "react";
import "./App.css";

// Utils
import { BrowserRouter as Router } from "react-router-dom";
import { prefetchCommonResources } from "./util/performance";

// Components
import HeaderNavigation from "./components/layouts/header.tsx";
import DSPBackground from "./components/layouts/DSPBackground.tsx";
import AnimatedRoutes from "./components/common/AnimatedRoutes.tsx";
import LoginPopup from "./pages/login";

//Assets
import LogoDSP from "./assets/dsp_no_background.png";

// Import the types and predefined navigation
import { NavItem, publicNavLinks, privateNavLinks } from "./components/layouts/header.types";
// Import Auth Context
import { AuthProvider } from "./context/AuthContext.tsx";
import { ModuleProvider } from "./context/ModuleContext.tsx";
import { ExamProvider } from "./context/ExamContext.tsx";
import { Toaster } from "sonner";
import { useMicrosoftAuth } from "./hooks/use_microsoft_auth";
import { useAuth } from "./context/AuthContext.tsx";

const AppContent: React.FC = () => {
  // Preload critical resources for better SPA performance
  React.useEffect(() => {
    prefetchCommonResources();
  }, []);
  
  const { user, logout, isLoading } = useAuth();
  const [isLoginPopupOpen, setLoginPopupOpen] = useState(false);
  const { isLoading: isOAuthLoading } = useMicrosoftAuth();

  const openLoginPopup = () => setLoginPopupOpen(true);
  const closeLoginPopup = () => setLoginPopupOpen(false);

  const isAdmin = !!(user?.is_staff || user?.is_superuser);
  const isAuthenticated = !!user;

  // Hauptnavigation basierend auf Auth-Status
  const mainNav = isAuthenticated
    ? [
        ...privateNavLinks,
        ...(isAdmin ? [{ title: "Back‑Office", to: "/admin" }] : []),
        { title: "Content Demo", to: "/content-demo" },
      ]
    : publicNavLinks;

  // Rechte Navigation
  const rightNav: NavItem[] = isAuthenticated
    ? [
        { title: "Einstellungen", to: "/settings" },
        { title: "Ausloggen", action: logout },
      ]
    : [{ title: "Einloggen", action: openLoginPopup }];

  if (isLoading || isOAuthLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <img src={LogoDSP} alt="DSP Logo" className="h-16 mb-8 opacity-90" />
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">
            {isOAuthLoading
              ? "Microsoft Anmeldung läuft..."
              : "E-Learning wird geladen..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <DSPBackground />
      <Toaster position="bottom-right" richColors />
      
      <HeaderNavigation
        logo={<img src={LogoDSP} alt="Logo" className="h-12" />}
        links={mainNav}
        rightContent={rightNav}
        isAuthenticated={isAuthenticated}
      />

      <main className="flex-grow overflow-auto">
        <div className="mx-20 my-10">
          <AnimatedRoutes isAdmin={isAdmin} />
        </div>
      </main>

      {isLoginPopupOpen && <LoginPopup onClose={closeLoginPopup} />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ModuleProvider>
          <ExamProvider>
            <AppContent />
          </ExamProvider>
        </ModuleProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
