import { ReactNode } from "react";

export type NavLink = { 
  to: string; 
  title: string; 
  icon?: ReactNode;
  requiresAuth?: boolean;
};

export type NavItem =
  | { to: string; title: string; icon?: ReactNode; action?: never; requiresAuth?: boolean }
  | { action: () => void; title: string; icon?: ReactNode; to?: never; requiresAuth?: boolean };

export type HeaderNavigationProps = {
  logo?: ReactNode;
  links: NavLink[];
  rightContent?: NavItem[];
  className?: string;
  isAuthenticated?: boolean;
};

// Vordefinierte Navigation für nicht eingeloggte Benutzer
export const publicNavLinks: NavLink[] = [
  { title: "Startseite", to: "/" },
  { title: "Preise", to: "/subscriptions" },
  { 
    title: "Homepage", 
    to: "https://datasmartpoint.com/?campaign=search&gad_source=1&gclid=Cj0KCQjw2N2_BhCAARIsAK4pEkWFhF857MNP-sEAtIJvfG32jDDe1wbcFucbaaWDH-N9DYaHlNN__X4aAoKqEALw_wcB" 
  }
];

// Vordefinierte Navigation für eingeloggte Benutzer
export const privateNavLinks: NavLink[] = [
  { title: "Dashboard", to: "/dashboard" },
  { title: "Zertifikatspfade", to: "/certification-paths" },
  { title: "Module & Lerninhalte", to: "/modules" },
  { title: "Abschlussprüfungen", to: "/final-exam" },
  { title: "Deine Statistik", to: "/user-stats" }
];
