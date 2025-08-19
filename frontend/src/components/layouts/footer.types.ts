import { ReactNode } from "react";
import {NavLink} from "react-router-dom";

// --- Navigation Types ---

/**
 * Navigation-Link für URLs
 */
export type NavLink = {
  to: string;
  title: string;
  icon?: ReactNode;
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
    }
  | {
      action: () => void;
      title: string;
      icon?: ReactNode;
      to?: never;
    };

/**
 * Props für Footer-Navigation-Komponente
 */
export type FooterNavigationProps = {
  logo?: ReactNode;
  links: NavLink[];
  rightContent?: NavItem[];
  className?: string;
};

/**
 * Vordefinierte Navigation
 */

export const FooterNavigation: NavLink[] = [

]