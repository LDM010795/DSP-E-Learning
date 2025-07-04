import React from "react";
import { AnimatePresence } from "framer-motion";
import { Routes, Route, useLocation } from "react-router-dom";
import PageTransition from "./PageTransition";

// Pages - Import all pages
import Dashboard from "../../pages/dashboard";
import Modules from "../../pages/modules";
import ModuleDetail from "../../pages/module_detail";
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

// Components
import ProtectedRoute from "../utils/ProtectedRoute";

interface AnimatedRoutesProps {
  isAdmin: boolean;
}

const AnimatedRoutes: React.FC<AnimatedRoutesProps> = ({ isAdmin }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Öffentliche Routen */}
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

        {/* Geschützte Routen mit ProtectedRoute umschließen */}
        <Route element={<ProtectedRoute />}>
          {/* Neue Route für erzwungene Passwortänderung */}
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
          {/* Bestehende Kind-Routen von ProtectedRoute */}
          <Route 
            path="/dashboard" 
            element={
              <PageTransition>
                <Dashboard />
              </PageTransition>
            } 
          />
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
            path="/modules/:moduleId/tasks/:taskId"
            element={
              <PageTransition>
                <TaskDetails />
              </PageTransition>
            }
          />
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

          {/* Admin Panel Route - nur für Staff/Superuser */}
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

        {/* Fallback oder 404 Route */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes; 