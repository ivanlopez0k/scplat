import { useNavigate, useLocation } from "react-router-dom";
import type { ReactElement } from "react";
import type { SidebarConfig } from "./Sidebar.types";
import "./Sidebar.css";

export interface SidebarProps {
  config: SidebarConfig;
}

export default function Sidebar({ config }: SidebarProps): ReactElement {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="sidebar">
      {/* Logo */}
      {config.logo && (
        <div className="sidebar__logo">
          {config.logo.src ? (
            <img src={config.logo.src} alt={config.logo.alt} />
          ) : (
            <span className="sidebar__logo-text">{config.logo.text}</span>
          )}
        </div>
      )}

      {/* Navigation Links */}
      <nav className="sidebar__nav">
        {config.links.map((link) => {
          const isActive = location.pathname === link.href;
          return (
            <button
              key={link.label}
              className={`sidebar__link ${isActive ? "sidebar__link--active" : ""}`}
              onClick={() => {
                if (link.onClick) {
                  link.onClick();
                } else {
                  navigate(link.href);
                }
              }}
            >
              <span className="sidebar__link-icon">{link.icon}</span>
              <span>{link.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Actions (optional, for admin) */}
      {config.actions && config.actions.length > 0 && (
        <div className="sidebar__actions">
          {config.actions.map((action, index) => (
            <button
              key={index}
              className={`sidebar__action sidebar__action--${action.variant || 'default'}`}
              onClick={action.onClick}
            >
              <span className="sidebar__link-icon">{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Logout */}
      <button className="sidebar__logout" onClick={config.logout.onClick}>
        <span className="sidebar__link-icon">{config.logout.icon}</span>
        <span>{config.logout.label}</span>
      </button>
    </aside>
  );
}
