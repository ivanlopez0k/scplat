import type { ReactNode } from "react";

export type UserRole = 'student' | 'teacher' | 'parent' | 'admin';

export interface SidebarLink {
  icon: ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

export interface SidebarAction {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'danger';
}

export interface SidebarConfig {
  logo?: {
    src?: string;
    text?: string;
    alt: string;
  };
  links: SidebarLink[];
  actions?: SidebarAction[];
  logout: {
    icon: ReactNode;
    label: string;
    onClick: () => void;
  };
}
