import { useMemo } from "react";
import type { UserRole, SidebarConfig } from "./Sidebar.types";
import { studentSidebarConfig, adminSidebarConfig, parentSidebarConfig, teacherSidebarConfig } from "./Sidebar.config";

export function useSidebarConfig(
  role: UserRole,
  handlers: {
    onLogout: () => void;
    onManageSubjects?: () => void;
    onAddChild?: () => void;
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

    if (role === 'parent') {
      return {
        ...parentSidebarConfig,
        logout: {
          ...parentSidebarConfig.logout,
          onClick: handlers.onLogout,
        },
        actions: parentSidebarConfig.actions?.map(action => ({
          ...action,
          onClick: action.label.includes('Agregar hijo')
            ? handlers.onAddChild || (() => {})
            : action.onClick,
        })),
      };
    }

    if (role === 'teacher') {
      return {
        ...teacherSidebarConfig,
        logout: {
          ...teacherSidebarConfig.logout,
          onClick: handlers.onLogout,
        },
      };
    }

    // Student uses the same config
    return {
      ...studentSidebarConfig,
      logout: {
        ...studentSidebarConfig.logout,
        onClick: handlers.onLogout,
      },
    };
  }, [role, handlers.onLogout, handlers.onManageSubjects, handlers.onAddChild]);
}
