import React, { useMemo, useState } from "react";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import { IoCardOutline } from "react-icons/io5";
import clsx from "clsx";
import LinkSidebar from "../ui_elements/links/link_sidebar";
import { HeaderNavigationProps, NavLink, NavItem } from "./header.types";

const HeaderNavigation: React.FC<HeaderNavigationProps> = ({
  logo,
  links,
  rightContent = [],
  className = "",
  isAuthenticated = false,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const subscriptionsLink: NavLink = {
    to: "/subscriptions",
    title: "Abonnements", // German label
    icon: <IoCardOutline className="w-5 h-5" />,
    requiresAuth: true,
  };

  const linksWithSubscriptions = useMemo(() => {
    const alreadyHas = links.some((l) => l.to === "/subscriptions");
    return alreadyHas ? links : [...links, subscriptionsLink];
  }, [links]);

  // Filtere Links basierend auf Auth-Status
  const filteredLinks = linksWithSubscriptions.filter(
    (link) => !link.requiresAuth || (link.requiresAuth && isAuthenticated),
  );

  const filteredRightContent = rightContent.filter(
    (item) =>
      !("requiresAuth" in item) || (item.requiresAuth && isAuthenticated),
  );

  const renderNavLinks = (navLinks: NavLink[], showTitle = true) =>
    navLinks.map((link, index) => (
      <li key={index}>
        <LinkSidebar to={link.to} icon={link.icon}>
          {showTitle ? link.title : null}
        </LinkSidebar>
      </li>
    ));

  const renderRightContentItems = (items: NavItem[], showTitle = true) =>
    items.map((item, index) => (
      <li key={index}>
        {item.to ? (
          <LinkSidebar to={item.to} icon={item.icon}>
            {showTitle ? item.title : null}
          </LinkSidebar>
        ) : (
          <button
            onClick={item.action}
            className="flex items-center px-3 py-1.5 text-sm font-medium rounded-lg text-gray-700 hover:text-dsp-orange 
                     hover:bg-dsp-orange/5 transition-colors duration-200 cursor-pointer"
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
          "sticky top-0 z-40 w-full bg-white/95 border-b border-dsp-orange/10 shadow-sm",
          "transition-all duration-200",
          className,
        )}
      >
        <div className="max-w-[95vw] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Left Section: Logo & Mobile Menu */}
            <div className="flex items-center gap-3">
              {logo && (
                <div className="h-8 flex items-center">
                  <div className="relative">
                    <div className="p-1 rounded-lg hover:scale-105 transition-transform duration-200">
                      {logo}
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileOpen((prev) => !prev)}
                className="md:hidden relative p-1.5 rounded-lg text-gray-700 hover:text-dsp-orange 
                         hover:bg-dsp-orange/5 transition-colors duration-200"
                aria-label="Toggle Navigation"
              >
                {mobileOpen ? (
                  <IoMdClose className="w-5 h-5" />
                ) : (
                  <IoMdMenu className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Center: Desktop Navigation */}
            <nav className="hidden md:flex flex-1 justify-center items-center mx-4">
              <ul className="flex items-center gap-1">
                {renderNavLinks(filteredLinks)}
              </ul>
            </nav>

            {/* Right Section */}
            <div className="hidden md:flex items-center justify-end">
              <ul className="flex items-center gap-1">
                {renderRightContentItems(filteredRightContent)}
              </ul>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div data-testid="mobile-menu" className="fixed inset-0 z-30 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/10 transition-opacity duration-200"
            onClick={() => setMobileOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed top-14 inset-x-0 bg-white border-b border-dsp-orange/10 shadow-md">
            <nav className="max-w-[95vw] mx-auto p-4">
              {/* Main Navigation */}
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2 px-2">
                  Navigation
                </p>
                <ul className="space-y-1">
                  {filteredLinks.map((link, index) => (
                    <li key={index}>
                      <LinkSidebar
                        to={link.to}
                        icon={link.icon}
                        className="flex items-center w-full px-3 py-2 text-gray-700 hover:text-dsp-orange 
                                 hover:bg-dsp-orange/5 rounded-lg transition-colors duration-200"
                      >
                        {link.title}
                      </LinkSidebar>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Account Section */}
              {filteredRightContent.length > 0 && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2 px-2">
                    Account
                  </p>
                  <ul className="space-y-1">
                    {filteredRightContent.map((item, index) => (
                      <li key={index}>
                        {item.to ? (
                          <LinkSidebar
                            to={item.to}
                            icon={item.icon}
                            className="flex items-center w-full px-3 py-2 text-gray-700 hover:text-dsp-orange 
                                     hover:bg-dsp-orange/5 rounded-lg transition-colors duration-200"
                          >
                            {item.title}
                          </LinkSidebar>
                        ) : (
                          <button
                            onClick={() => {
                              item.action?.();
                              setMobileOpen(false);
                            }}
                            className="flex items-center w-full px-3 py-2 text-gray-700 hover:text-dsp-orange 
                                     hover:bg-dsp-orange/5 rounded-lg transition-colors duration-200 text-left"
                            aria-label={item.title}
                          >
                            {item.icon && (
                              <span className="mr-2 text-gray-500">
                                {item.icon}
                              </span>
                            )}
                            <span>{item.title}</span>
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
      )}
    </>
  );
};

export default HeaderNavigation;
