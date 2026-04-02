import { useMemo } from "react";
import type { UserRole, SidebarConfig } from "./Sidebar.types";
import { studentSidebarConfig, adminSidebarConfig } from "./Sidebar.config";

export function useSidebarConfig(
  role: UserRole,
  handlers: {
    onLogout: () => void;
    onManageSubjects?: () => void;
  }
): SidebarConfig {
  return useMemo(() => {
    if (role === 'admin') {
      return {
        ...adminSidebarConfig,
        logout: {
          ...adminSidebarConfig.logout,
          onClick: handlers.onLogout,
        },
        actions: adminSidebarConfig.actions?.map(action => ({
          ...action,
          onClick: action.label.includes('Gestionar') 
            ? handlers.onManageSubjects || (() => {}) 
            : action.onClick,
        })),
      };
    }

    // Student, teacher, parent use the same config for now
    return {
      ...studentSidebarConfig,
      logout: {
        ...studentSidebarConfig.logout,
        onClick: handlers.onLogout,
      },
    };
  }, [role, handlers.onLogout, handlers.onManageSubjects]);
}
