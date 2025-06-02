import { ReactNode } from "react";
import { NavLink } from "react-router-dom";

type SidebarLinkProps = {
  to: string;
  icon?: ReactNode;
  children?: ReactNode;
};

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, children }) => {
  // Prüfe, ob es sich um einen externen Link handelt
  const isExternalLink = to.startsWith("http") || to.startsWith("https");

  // Für externe Links verwenden wir einen normalen <a> Tag
  if (isExternalLink) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center p-2 text-base rounded-lg hover:text-dsp-orange"
      >
        {icon && (
          <span className="mr-2 transition-colors duration-200">{icon}</span>
        )}
        <span className="transition-colors duration-200">{children}</span>
      </a>
    );
  }

  // Für interne Links verwenden wir NavLink
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center p-2 text-base rounded-lg hover:text-dsp-orange ${
          isActive ? "text-dsp-orange font-bold" : ""
        }`
      }
    >
      {icon && (
        <span className="mr-2 transition-colors duration-200">{icon}</span>
      )}
      <span className="transition-colors duration-200">{children}</span>
    </NavLink>
  );
};

export default SidebarLink;
