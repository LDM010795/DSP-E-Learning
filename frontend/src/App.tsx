/**
 * App Component - E-Learning DSP Frontend
 *
 * Hauptanwendungskomponente für die E-Learning-Plattform:
 * - Routing und Navigation
 * - Authentifizierung und Autorisierung
 * - Context Provider Setup
 * - Performance-Optimierung mit Prefetching
 * - Responsive Design
 * 
 * Features:
 * - React Router für Navigation
 * - Microsoft OAuth Integration
 * - Admin-Panel Zugriff
 * - Loading-States
 * - Toast-Benachrichtigungen
 * - Lazy Loading und Performance-Optimierung
 * 
 * Author: DSP Development Team
 * Created: 10.07.2025
 * Version: 1.0.0
 */

import React, { useState } from "react";
import "./App.css";

// --- Utils ---
import { BrowserRouter as Router } from "react-router-dom";
import { prefetchCommonResources } from "./util/performance";

// --- Components ---
import HeaderNavigation from "./components/layouts/header.tsx";
import DSPBackground from "./components/layouts/DSPBackground.tsx";
import AnimatedRoutes from "./components/common/AnimatedRoutes.tsx";
import LoginPopup from "./pages/login";

// --- Assets ---
import LogoDSP from "./assets/dsp_no_background.png";

// --- Types and Navigation ---
import { NavItem, publicNavLinks, privateNavLinks } from "./components/layouts/header.types";

// --- Context Providers ---
import { AuthProvider } from "./context/AuthContext.tsx";
import { ModuleProvider } from "./context/ModuleContext.tsx";
import { ExamProvider } from "./context/ExamContext.tsx";

// --- UI Components ---
import { Toaster } from "sonner";

// --- Hooks ---
import { useMicrosoftAuth } from "./hooks/use_microsoft_auth";
import { useAuth } from "./context/AuthContext.tsx";

/**
 * AppContent Komponente
 * 
 * Hauptinhalt der Anwendung mit Navigation, Routing und
 * Authentifizierungslogik.
 */
const AppContent: React.FC = () => {
  // --- Performance Optimization ---
  React.useEffect(() => {
    prefetchCommonResources();
  }, []);
  
  // --- State Management ---
  const { user, logout, isLoading } = useAuth();
  const [isLoginPopupOpen, setLoginPopupOpen] = useState(false);
  const { isLoading: isOAuthLoading } = useMicrosoftAuth();

  // --- Event Handlers ---
  const openLoginPopup = () => setLoginPopupOpen(true);
  const closeLoginPopup = () => setLoginPopupOpen(false);

  // --- Authorization Logic ---
  const isAdmin = !!(user?.is_staff || user?.is_superuser);
  const isAuthenticated = !!user;

  // --- Navigation Configuration ---
  const mainNav = isAuthenticated
    ? [
        ...privateNavLinks,
        ...(isAdmin ? [{ title: "Back‑Office", to: "/admin" }] : []),
        { title: "Content Demo", to: "/content-demo" },
      ]
    : publicNavLinks;

  const rightNav: NavItem[] = isAuthenticated
    ? [
        { title: "Einstellungen", to: "/settings" },
        { title: "Ausloggen", action: logout },
      ]
    : [{ title: "Einloggen", action: openLoginPopup }];

  // --- Loading State ---
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
      {/* --- Background and Notifications --- */}
      <DSPBackground />
      <Toaster position="bottom-right" richColors />
      
      {/* --- Header Navigation --- */}
      <HeaderNavigation
        logo={<img src={LogoDSP} alt="Logo" className="h-12" />}
        links={mainNav}
        rightContent={rightNav}
        isAuthenticated={isAuthenticated}
      />

      {/* --- Main Content Area --- */}
      <main className="flex-grow overflow-auto">
        <div className="mx-20 my-10">
          <AnimatedRoutes isAdmin={isAdmin} />
        </div>
      </main>

      {/* --- Login Popup --- */}
      {isLoginPopupOpen && <LoginPopup onClose={closeLoginPopup} />}
    </div>
  );
};

/**
 * App Komponente
 * 
 * Root-Komponente mit Context Provider Setup für
 * Authentifizierung, Module und Prüfungen.
 */
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
