import { ReactNode } from "react";
import { NavLink } from "react-router-dom";

type SidebarLinkProps = {
  to: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
};

const SidebarLink: React.FC<SidebarLinkProps> = ({
  to,
  icon,
  children,
  className = "",
}) => {
  // Prüfe, ob es sich um einen externen Link handelt
  const isExternalLink = to.startsWith("http") || to.startsWith("https");

  // Standard-Styling für moderne Links
  const baseClasses = `
    flex items-center px-4 py-2 text-sm font-medium rounded-xl
    transition-all duration-200 ease-in-out
    hover:bg-[#ff863d]/5 hover:text-[#ff863d]
    border border-transparent hover:border-[#ff863d]/20
    backdrop-blur-sm hover:shadow-sm group
    ${className}
  `.trim();

  // Für externe Links verwenden wir einen normalen <a> Tag
  if (isExternalLink) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClasses} text-gray-700 hover:scale-[1.02]`}
      >
        {icon && (
          <span className="mr-3 text-gray-500 group-hover:text-[#ff863d] transition-colors duration-200">
            {icon}
          </span>
        )}
        <span className="group-hover:translate-x-0.5 transition-transform duration-200">
          {children}
        </span>
        {/* External link indicator */}
        <svg
          className="ml-2 w-3 h-3 text-gray-400 group-hover:text-[#ff863d] opacity-60 group-hover:opacity-100 transition-all duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
    );
  }

  // Für interne Links verwenden wir NavLink
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${baseClasses} ${
          isActive
            ? "text-[#ff863d] bg-[#ff863d]/10 border-[#ff863d]/30 shadow-sm font-semibold"
            : "text-gray-700 hover:scale-[1.02]"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {icon && (
            <span
              className={`mr-3 transition-all duration-200 ${
                isActive
                  ? "text-[#ff863d] scale-110"
                  : "text-gray-500 group-hover:text-[#ff863d] group-hover:scale-110"
              }`}
            >
              {icon}
            </span>
          )}
          <span
            className={`transition-all duration-200 ${
              isActive ? "translate-x-0.5" : "group-hover:translate-x-0.5"
            }`}
          >
            {children}
          </span>
          {/* Active indicator */}
          {isActive && (
            <div className="ml-auto">
              <div className="w-1.5 h-1.5 bg-[#ff863d] rounded-full animate-pulse"></div>
            </div>
          )}
        </>
      )}
    </NavLink>
  );
};

export default SidebarLink;
