/**
 * Animated Routes Component - E-Learning DSP Frontend
 *
 * Routing-Komponente mit Animationen und geschützten Routen:
 * - Framer Motion Integration für flüssige Übergänge
 * - Geschützte Routen mit Authentifizierung
 * - Admin-Panel-Zugriff für Staff-Benutzer
 * - Page-Transition-Animationen
 *
 * Features:
 * - AnimatePresence für Exit-Animationen
 * - ProtectedRoute für Authentifizierung
 * - Rollenbasierte Navigation
 * - Lazy Loading für bessere Performance
 * - TypeScript-Typisierung
 *
 * Author: DSP Development Team
 * Created: 10.07.2025
 * Version: 1.0.0
 */

import React from "react";
import { AnimatePresence } from "framer-motion";
import { Routes, Route, useLocation } from "react-router-dom";
import PageTransition from "./PageTransition";

// --- Page Imports ---
import Dashboard from "../../pages/dashboard";
import Modules from "../../pages/modules";
import ModuleDetail from "../../pages/module_detail";
import ChapterDetail from "../../pages/chapter_detail";
import TaskDetails from "../../pages/task_detail";
import IndexFinalExam from "../../pages/final_exam/index_final_exam";
import IndexStatistics from "../../pages/statistics/index_statistics";
import LandingPage from "../../pages/landing_page";
import IndexUserSettings from "../../pages/user_settings/index_user_settings";
import SubscriptionsPage from "../../pages/subscriptions";
import IndexAdminPanel from "../../pages/admin_panel/index_admin_panel";
import ForcePasswordChangePage from "../../pages/ForcePasswordChangePage";
import CertificationPaths from "../../pages/certification_paths";
import ContentDemo from "../../pages/ContentDemo";
import ArticlePage from "../../pages/article";
import ExternalRegister from "../../pages/ExternalRegister";
import PaymentsSuccess from "../../pages/payments/Success";
import PaymentsCancel from "../../pages/payments/Cancel";


// --- Component Imports ---
import ProtectedRoute from "../utils/ProtectedRoute";
import Impressum from "../../pages/Impressum.tsx";
import Privacypolicy from "../../pages/Privacypolicy.tsx";
import AGBs from "../../pages/AGBs.tsx";

/**
 * Props für AnimatedRoutes Komponente
 */
interface AnimatedRoutesProps {
  isAdmin: boolean;
}

/**
 * Animated Routes Komponente
 *
 * Verwaltet das Routing der Anwendung mit Animationen
 * und geschützten Routen basierend auf Authentifizierung.
 */
const AnimatedRoutes: React.FC<AnimatedRoutesProps> = ({ isAdmin }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* --- Öffentliche Routen --- */}
        <Route
          path="/"
          element={
            <PageTransition>
              <LandingPage />
            </PageTransition>
          }
        />
        <Route
          path="/subscriptions"
          element={
            <PageTransition>
              <SubscriptionsPage />
            </PageTransition>
          }
        />
        <Route
          path={"/Impressum"}
          element={
            <PageTransition>
              <Impressum />
            </PageTransition>
          }
        />
        <Route
          path={"/AGB"}
          element={
            <PageTransition>
              <AGBs />
            </PageTransition>
          }
        />
        <Route
          path={"/Datenschutz"}
          element={
            <PageTransition>
              <Privacypolicy />
            </PageTransition>
          }
        />
        <Route
          path="/register"
          element={
            <PageTransition>
              <ExternalRegister />
            </PageTransition>
          }
        />
          <Route
             path="/payments/success"
             element={<PaymentsSuccess />}
         />
         <Route
             path="/payments/cancel"
             element={<PaymentsCancel />}
         />

        {/* --- Geschützte Routen --- */}
        <Route element={<ProtectedRoute />}>
          {/* Erzwungene Passwortänderung */}
          <Route
            path="/force-password-change"
            element={
              <PageTransition>
                <ForcePasswordChangePage />
              </PageTransition>
            }
          />

          {/* Content Demo Route */}
          <Route
            path="/content-demo"
            element={
              <PageTransition>
                <ContentDemo />
              </PageTransition>
            }
          />

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <PageTransition>
                <Dashboard />
              </PageTransition>
            }
          />

          {/* Module und Lerninhalte */}
          <Route
            path="/modules"
            element={
              <PageTransition>
                <Modules />
              </PageTransition>
            }
          />
          <Route
            path="/modules/:moduleId"
            element={
              <PageTransition>
                <ModuleDetail />
              </PageTransition>
            }
          />
          <Route
            path="/modules/:moduleId/articles"
            element={
              <PageTransition>
                <ArticlePage />
              </PageTransition>
            }
          />
          <Route
            path="/modules/:moduleId/chapters/:chapterId"
            element={
              <PageTransition>
                <ChapterDetail />
              </PageTransition>
            }
          />
          <Route
            path="/modules/:moduleId/tasks/:taskId"
            element={
              <PageTransition>
                <TaskDetails />
              </PageTransition>
            }
          />

          {/* Prüfungen und Zertifikate */}
          <Route
            path="/final-exam"
            element={
              <PageTransition>
                <IndexFinalExam />
              </PageTransition>
            }
          />
          <Route
            path="/certification-paths"
            element={
              <PageTransition>
                <CertificationPaths />
              </PageTransition>
            }
          />

          {/* Benutzereinstellungen und Statistiken */}
          <Route
            path="/user-stats"
            element={
              <PageTransition>
                <IndexStatistics />
              </PageTransition>
            }
          />
          <Route
            path="/settings"
            element={
              <PageTransition>
                <IndexUserSettings />
              </PageTransition>
            }
          />

          {/* --- Admin Panel Route (nur für Staff/Superuser) --- */}
          {isAdmin && (
            <Route
              path="/admin"
              element={
                <PageTransition>
                  <IndexAdminPanel />
                </PageTransition>
              }
            />
          )}
        </Route>

        {/* --- Fallback Route --- */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
