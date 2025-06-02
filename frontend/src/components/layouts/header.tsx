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
            className="flex items-center p-2 text-base rounded-lg hover:text-dsp-orange transition-colors duration-200 cursor-pointer"
            aria-label={item.title}
          >
            {item.icon}
            {showTitle && <span>{item.title}</span>}
          </button>
        )}
      </li>
    ));

  return (
    <header
      className={clsx(
        "w-full py-3 bg-white shadow flex items-center justify-between border-b-3 border-dsp-orange px-6 md:px-10 gap-4",
        className
      )}
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-4 w-[200px]">
        {logo && <div className="h-8 flex items-center">{logo}</div>}
        {/* Mobile Burger Button */}
        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="md:hidden p-2 rounded hover:bg-gray-100 cursor-pointer"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <IoMdClose size={24} /> : <IoMdMenu size={24} />}
        </button>
      </div>

      {/* Center: Desktop Navigation */}
      <nav className="hidden md:flex flex-1 justify-center items-center">
        <ul className="flex items-center justify-center gap-8 h-full">
          {renderNavLinks(links)}
        </ul>
      </nav>

      {/* Right: Custom Content */}
      <div className="hidden md:flex items-center w-[200px] justify-end">
        <ul className="flex items-center gap-4">
          {renderRightContentItems(rightContent)}
        </ul>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md z-50 md:hidden">
          <nav className="flex flex-col px-6 py-4 gap-4 border-t border-gray-200">
            <ul className="flex flex-col gap-3">{renderNavLinks(links)}</ul>
            {rightContent.length > 0 && (
              <ul className="flex flex-col gap-3 border-t border-dsp-orange pt-3">
                {renderRightContentItems(rightContent)}
              </ul>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default HeaderNavigation;
