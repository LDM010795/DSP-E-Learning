import React, { useState } from "react";
import "./App.css";
// Pages
import Dashboard from "./pages/dashboard";
import Modules from "./pages/modules";
import ModuleDetail from "./pages/module_detail";
import TaskDetails from "./pages/task_detail.tsx";
import IndexFinalExam from "./pages/final_exam/index_final_exam";
import IndexStatistics from "./pages/statistics/index_statistics";
import LandingPage from "./pages/landing_page";
import IndexUserSettings from "./pages/user_settings/index_user_settings";
import LoginPopup from "./pages/login";
import SubscriptionsPage from "./pages/subscriptions";
import IndexAdminPanel from "./pages/admin_panel/index_admin_panel";
import ForcePasswordChangePage from "./pages/ForcePasswordChangePage";
import CertificationPaths from "./pages/certification_paths";
import ContentDemo from "./pages/ContentDemo";
// Utils
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// Components
import HeaderNavigation from "./components/layouts/header.tsx";
import DSPBackground from "./components/layouts/DSPBackground.tsx";
//Assets
import LogoDSP from "./assets/dsp_no_background.png";

// Import the NavItem type
import { NavItem } from "./components/layouts/header.tsx";
// Import Auth Context
import { AuthProvider, useAuth } from "./context/AuthContext.tsx";
import { ModuleProvider } from "./context/ModuleContext";
import { ExamProvider } from "./context/ExamContext";
import ProtectedRoute from "./components/utils/ProtectedRoute.tsx";
import { Toaster } from "sonner";
import { useMicrosoftAuth } from "./hooks/use_microsoft_auth";

// Verschiebe Navigationsdaten und die Hauptlogik in eine separate Komponente,
// damit `useAuth` verwendet werden kann.
const AppContent: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const [isLoginPopupOpen, setLoginPopupOpen] = useState(false);

  // Microsoft OAuth Hook mit Loading State
  const { isLoading: isOAuthLoading } = useMicrosoftAuth();

  const openLoginPopup = () => setLoginPopupOpen(true);
  const closeLoginPopup = () => setLoginPopupOpen(false);

  // Überprüfen, ob der Benutzer Admin-Rechte hat (is_staff oder is_superuser)
  const isAdmin = user && (user.is_staff || user.is_superuser);

  // Passe die Navigation basierend auf dem Login-Status an
  // Hauptnavigation (links/mitte) erwartet `NavLink[]` (immer mit `to`)
  const mainNav: { to: string; title: string; icon?: React.ReactNode }[] = [
    // Nicht eingeloggte Benutzer sehen:
    ...(user === null
      ? [
          // 1. Startseite
          { title: "Startseite", to: "/" },
          // 2. Preise
          { title: "Preise", to: "/subscriptions" },
          // 3. Homepage
          {
            title: "Homepage",
            to: "https://datasmartpoint.com/?campaign=search&gad_source=1&gclid=Cj0KCQjw2N2_BhCAARIsAK4pEkWFhF857MNP-sEAtIJvfG32jDDe1wbcFucbaaWDH-N9DYaHlNN__X4aAoKqEALw_wcB",
          },
        ]
      : []),
    // Eingeloggte Benutzer sehen:
    ...(user !== null
      ? [
          { title: "Dashboard", to: "/dashboard" },
          { title: "Zertifikatspfade", to: "/certification-paths" },
          { title: "Module & Lerninhalte", to: "/modules" },
          { title: "Abschlussprüfungen", to: "/final-exam" },
          { title: "Deine Statistik", to: "/user-stats" },
          // Nur Admin-Benutzer sehen den Admin-Panel Link
          ...(isAdmin ? [{ title: "Back‑Office", to: "/admin" }] : []),
          // 🔥 NEU: Content Demo für alle eingeloggten User
          { title: "Content Demo", to: "/content-demo" },
        ]
      : []),
  ];

  // Rechte Navigation (kann Links oder Aktionen enthalten) erwartet `NavItem[]`
  const currentRightNav: NavItem[] = user
    ? [
        { title: "Einstellungen", to: "/settings" },
        { title: "Ausloggen", action: logout },
      ]
    : [{ title: "Einloggen", action: openLoginPopup }];

  // Zeige Loading während AuthContext ODER OAuth läuft
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
      {/* DSP Background - Global für alle Seiten */}
      <DSPBackground />
      <Toaster position="bottom-right" richColors />
      {/* Header */}
      <HeaderNavigation
        logo={<img src={LogoDSP} alt="Logo" className="h-12" />}
        links={mainNav}
        rightContent={currentRightNav}
      />

      {/* Main Content */}
      <main className="flex-grow overflow-auto  ">
        <div className="mx-20 my-10 ">
          <Routes>
            {/* Öffentliche Routen */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />

            {/* Geschützte Routen mit ProtectedRoute umschließen */}
            <Route element={<ProtectedRoute />}>
              {/* Neue Route für erzwungene Passwortänderung */}
              <Route
                path="/force-password-change"
                element={<ForcePasswordChangePage />}
              />
              {/* NEU: Content Demo Route */}
              <Route path="/content-demo" element={<ContentDemo />} />
              {/* Bestehende Kind-Routen von ProtectedRoute */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/modules" element={<Modules />} />
              <Route path="/modules/:moduleId" element={<ModuleDetail />} />
              <Route
                path="/modules/:moduleId/tasks/:taskId"
                element={<TaskDetails />}
              />
              <Route path="/final-exam" element={<IndexFinalExam />} />
              <Route
                path="/certification-paths"
                element={<CertificationPaths />}
              />
              <Route path="/user-stats" element={<IndexStatistics />} />
              <Route path="/settings" element={<IndexUserSettings />} />

              {/* Admin Panel Route - nur für Staff/Superuser */}
              {isAdmin && <Route path="/admin" element={<IndexAdminPanel />} />}
            </Route>

            {/* Fallback oder 404 Route */}
            {/* <Route path="*" element={<NotFoundPage />} /> */}
          </Routes>
        </div>
      </main>

      {/* Login Popup */}
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
