import { ReactNode, useState } from "react";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import clsx from "clsx";
import LinkSidebar from "../ui_elements/links/link_sidebar";

type NavLink = { to: string; title: string; icon?: ReactNode };

export type NavItem =
  | { to: string; title: string; icon?: ReactNode; action?: never }
  | { action: () => void; title: string; icon?: ReactNode; to?: never };

type HeaderNavigationProps = {
  logo?: ReactNode;
  links: NavLink[];
  rightContent?: NavItem[];
  className?: string;
};

const HeaderNavigation: React.FC<HeaderNavigationProps> = ({
  logo,
  links,
  rightContent = [],
  className = "",
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderNavLinks = (navLinks: NavLink[], showTitle = true) =>
    navLinks.map((link, index) => (
      <li key={index} className="flex items-center">
        <LinkSidebar to={link.to} icon={link.icon}>
          {showTitle ? link.title : null}
        </LinkSidebar>
      </li>
    ));

  const renderRightContentItems = (items: NavItem[], showTitle = true) =>
    items.map((item, index) => (
      <li key={index} className="flex items-center">
        {item.to ? (
          <LinkSidebar to={item.to} icon={item.icon}>
            {showTitle ? item.title : null}
          </LinkSidebar>
        ) : (
          <button
            onClick={item.action}
            className="flex items-center px-4 py-2 text-sm font-medium rounded-xl text-gray-700 hover:text-[#ff863d] 
                     hover:bg-[#ff863d]/5 transition-all duration-200 cursor-pointer
                     border border-transparent hover:border-[#ff863d]/20
                     backdrop-blur-sm hover:shadow-sm"
            aria-label={item.title}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {showTitle && <span>{item.title}</span>}
          </button>
        )}
      </li>
    ));

  return (
    <>
      <header
        className={clsx(
          "relative w-full bg-white/80 backdrop-blur-xl border-b border-[#ff863d]/20 shadow-lg shadow-[#ff863d]/5",
          "sticky top-0 z-40 transition-all duration-300",
          className
        )}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white to-[#ffe7d4]/20 pointer-events-none"></div>

        <div className="relative px-6 md:px-10">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Enhanced Left Section: Logo & Mobile Menu */}
            <div className="flex items-center gap-4 min-w-[200px]">
              {logo && (
                <div className="h-10 flex items-center group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#ff863d]/10 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative p-1 rounded-xl hover:scale-105 transition-transform duration-200">
                      {logo}
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Mobile Menu Button */}
              <button
                onClick={() => setMobileOpen((prev) => !prev)}
                className="md:hidden relative p-2 rounded-xl text-gray-700 hover:text-[#ff863d] 
                         hover:bg-[#ff863d]/5 transition-all duration-200 cursor-pointer
                         border border-transparent hover:border-[#ff863d]/20
                         backdrop-blur-sm hover:shadow-sm group"
                aria-label="Toggle Navigation"
              >
                <div className="relative">
                  {mobileOpen ? (
                    <IoMdClose className="w-6 h-6 transition-transform duration-200 group-hover:rotate-90" />
                  ) : (
                    <IoMdMenu className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
                  )}
                </div>
              </button>
            </div>

            {/* Enhanced Center: Desktop Navigation */}
            <nav className="hidden md:flex flex-1 justify-center items-center">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm px-2 py-1">
                <ul className="flex items-center justify-center gap-1">
                  {renderNavLinks(links)}
                </ul>
              </div>
            </nav>

            {/* Enhanced Right Section */}
            <div className="hidden md:flex items-center min-w-[200px] justify-end">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm px-2 py-1">
                <ul className="flex items-center gap-1">
                  {renderRightContentItems(rightContent)}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Active indicator line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff863d] via-[#fa8c45] to-[#ff863d] opacity-80"></div>
      </header>

      {/* Enhanced Mobile Navigation Dropdown */}
      {mobileOpen && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
            onClick={() => setMobileOpen(false)}
          />

          {/* Mobile menu */}
          <div className="fixed top-16 left-0 right-0 z-40 md:hidden">
            <div className="mx-4 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              <nav className="p-6">
                {/* Main navigation */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Navigation
                  </h3>
                  <ul className="space-y-1">
                    {links.map((link, index) => (
                      <li key={index}>
                        <LinkSidebar
                          to={link.to}
                          icon={link.icon}
                          className="flex items-center w-full px-4 py-3 text-gray-700 hover:text-[#ff863d] 
                                   hover:bg-[#ff863d]/5 rounded-xl transition-all duration-200
                                   border border-transparent hover:border-[#ff863d]/20"
                        >
                          {link.title}
                        </LinkSidebar>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right content */}
                {rightContent.length > 0 && (
                  <div className="pt-4 border-t border-gray-200/60">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Account
                    </h3>
                    <ul className="space-y-1">
                      {rightContent.map((item, index) => (
                        <li key={index}>
                          {item.to ? (
                            <LinkSidebar
                              to={item.to}
                              icon={item.icon}
                              className="flex items-center w-full px-4 py-3 text-gray-700 hover:text-[#ff863d] 
                                       hover:bg-[#ff863d]/5 rounded-xl transition-all duration-200
                                       border border-transparent hover:border-[#ff863d]/20"
                            >
                              {item.title}
                            </LinkSidebar>
                          ) : (
                            <button
                              onClick={() => {
                                item.action?.();
                                setMobileOpen(false);
                              }}
                              className="flex items-center w-full px-4 py-3 text-gray-700 hover:text-[#ff863d] 
                                       hover:bg-[#ff863d]/5 rounded-xl transition-all duration-200 cursor-pointer
                                       border border-transparent hover:border-[#ff863d]/20 text-left"
                              aria-label={item.title}
                            >
                              {item.icon && (
                                <span className="mr-3 text-gray-500">
                                  {item.icon}
                                </span>
                              )}
                              <span className="font-medium">{item.title}</span>
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default HeaderNavigation;
