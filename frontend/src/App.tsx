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
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import { prefetchCommonResources } from "./util/performance";

// --- React Query ---
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// --- Components ---
import HeaderNavigation from "./components/layouts/header.tsx";
import DSPBackground from "./components/layouts/DSPBackground.tsx";
import AnimatedRoutes from "./components/common/AnimatedRoutes.tsx";
import LoginPopup from "./pages/login";
import FooterNavigation from "./components/layouts/footer.tsx";

// --- Assets ---
import LogoDSP from "./assets/dsp_no_background.png";

// --- Types and Navigation ---
import {
  NavItem,
  publicNavLinks,
  privateNavLinks,
} from "./components/layouts/header.types";

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
  const location = useLocation();

  // --- Event Handlers ---
  const openLoginPopup = () => setLoginPopupOpen(true);
  const closeLoginPopup = () => setLoginPopupOpen(false);

  // --- Authorization Logic ---
  const isAdmin = !!(user?.is_staff || user?.is_superuser);
  const isAuthenticated = !!user;

  // --- Navigation Configuration ---
  const mainNav = isAuthenticated
    ? [
        // Nur erlaubte Links anzeigen (einige Routen bewusst ausblenden)
        ...privateNavLinks.filter(
          (link) =>
            ![
              "/certification-paths", // Zertifikatspfade
              "/final-exam", // Abschlussprüfungen
              "/user-stats", // Deine Statistik
            ].includes(link.to),
        ),
        // Kein Back‑Office, keine Content Demo im Header
      ]
    : publicNavLinks;

  const rightNav: NavItem[] = isAuthenticated
    ? [
        { title: "Einstellungen", to: "/settings" },
        { title: "Ausloggen", action: logout },
      ]
    : [{ title: "Einloggen", action: openLoginPopup }];

  // --- Check if current page should have full-screen layout (no margins) ---
  const isFullScreenPage =
    location.pathname === "/" || location.pathname === "/subscriptions";

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
        {isFullScreenPage ? (
          // Full-screen layout for landing page and subscriptions (no margins)
          <AnimatedRoutes isAdmin={isAdmin} />
        ) : (
          // Standard layout with margins for all other pages
          <div className="mx-2 sm:mx-6 md:mx-10 lg:mx-16 xl:mx-20 mt-2 sm:mt-3 md:mt-4 mb-6 lg:mb-8">
            <AnimatedRoutes isAdmin={isAdmin} />
          </div>
        )}
      </main>

      {/* --- Login Popup --- */}
      {isLoginPopupOpen && <LoginPopup onClose={closeLoginPopup} />}
      {/* Footer Navigation */}
      <FooterNavigation />
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
  // Create a client
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <ModuleProvider>
            <ExamProvider>
              <AppContent />
            </ExamProvider>
          </ModuleProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
