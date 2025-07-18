/**
 * Header Types - E-Learning DSP Frontend
 *
 * TypeScript-Typdefinitionen für Header-Navigation:
 * - Navigation-Links und -Items
 * - Header-Props und Konfiguration
 * - Vordefinierte Navigation für verschiedene Benutzerrollen
 *
 * Features:
 * - TypeScript-Typisierung für Navigation
 * - Flexible Link- und Action-Konfiguration
 * - Rollenbasierte Navigation
 * - Icon-Support für Navigation-Items
 *
 * Author: DSP Development Team
 * Created: 10.07.2025
 * Version: 1.0.0
 */

import { ReactNode } from "react";

// --- Navigation Types ---

/**
 * Navigation-Link für interne und externe URLs
 */
export type NavLink = {
  to: string;
  title: string;
  icon?: ReactNode;
  requiresAuth?: boolean;
};

/**
 * Navigation-Item mit Link oder Action
 */
export type NavItem =
  | {
      to: string;
      title: string;
      icon?: ReactNode;
      action?: never;
      requiresAuth?: boolean;
    }
  | {
      action: () => void;
      title: string;
      icon?: ReactNode;
      to?: never;
      requiresAuth?: boolean;
    };

/**
 * Props für Header-Navigation-Komponente
 */
export type HeaderNavigationProps = {
  logo?: ReactNode;
  links: NavLink[];
  rightContent?: NavItem[];
  className?: string;
  isAuthenticated?: boolean;
};

// --- Predefined Navigation ---

/**
 * Vordefinierte Navigation für nicht eingeloggte Benutzer
 */
export const publicNavLinks: NavLink[] = [
  { title: "Startseite", to: "/" },
  { title: "Preise", to: "/subscriptions" },
  {
    title: "Homepage",
    to: "https://datasmartpoint.com/?campaign=search&gad_source=1&gclid=Cj0KCQjw2N2_BhCAARIsAK4pEkWFhF857MNP-sEAtIJvfG32jDDe1wbcFucbaaWDH-N9DYaHlNN__X4aAoKqEALw_wcB",
  },
];

/**
 * Vordefinierte Navigation für eingeloggte Benutzer
 */
export const privateNavLinks: NavLink[] = [
  { title: "Dashboard", to: "/dashboard" },
  { title: "Zertifikatspfade", to: "/certification-paths" },
  { title: "Module & Lerninhalte", to: "/modules" },
  { title: "Abschlussprüfungen", to: "/final-exam" },
  { title: "Deine Statistik", to: "/user-stats" },
];
