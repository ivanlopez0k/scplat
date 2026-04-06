import type { SidebarConfig } from "./Sidebar.types";

// Icon components
const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3h8v8H3V3zm10 0h8v5h-8V3zM3 13h5v8H3v-8zm7 0h11v8H10v-8z"/>
  </svg>
);

const BookIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14zM6.5 5H18v10H6.5a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5z"/>
  </svg>
);

const GradeIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z"/>
  </svg>
);

const MessageIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 17l1.41-1.41L8.83 13H20v-2H8.83l2.58-2.59L10 7l-5 5 5 5zM4 5h8V3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8v-2H4V5z"/>
  </svg>
);

const UserPlusIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3V7H6v3H4zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
);

export const studentSidebarConfig: SidebarConfig = {
  logo: {
    src: "/Group_17.png",
    alt: "EducAR",
  },
  links: [
    {
      icon: <DashboardIcon />,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: <BookIcon />,
      label: "Mis materias",
      href: "/subjects",
    },
    {
      icon: <GradeIcon />,
      label: "Mis notas",
      href: "/grades",
    },
  ],
  logout: {
    icon: <LogoutIcon />,
    label: "Cerrar Sesión",
    onClick: () => {},
  },
};

export const adminSidebarConfig: SidebarConfig = {
  logo: {
    src: "/Group_17.png",
    alt: "EducAR",
  },
  links: [],
  actions: [
    {
      icon: "📚",
      label: "Gestionar Cursos/Materias",
      onClick: () => {},
      variant: 'primary' as const,
    },
  ],
  logout: {
    icon: <LogoutIcon />,
    label: "Cerrar Sesión",
    onClick: () => {},
  },
};

export const parentSidebarConfig: SidebarConfig = {
  logo: {
    src: "/Group_17.png",
    alt: "EducAR",
  },
  links: [
    {
      icon: <DashboardIcon />,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: <MessageIcon />,
      label: "Mensajes",
      href: "/parent-messages",
    },
  ],
  actions: [
    {
      icon: <UserPlusIcon />,
      label: "Agregar hijo",
      onClick: () => {},
      variant: 'primary' as const,
    },
  ],
  logout: {
    icon: <LogoutIcon />,
    label: "Cerrar Sesión",
    onClick: () => {},
  },
};

export const teacherSidebarConfig: SidebarConfig = {
  logo: {
    src: "/Group_17.png",
    alt: "EducAR",
  },
  links: [
    {
      icon: <BookIcon />,
      label: "Cursos",
      href: "/teacher-dashboard",
    },
    {
      icon: <MessageIcon />,
      label: "Mensajes",
      href: "/teacher-messages",
    },
    {
      icon: <UsersIcon />,
      label: "Alumnos",
      href: "/teacher-students",
    },
    {
      icon: <MessageIcon />,
      label: "Anuncios",
      href: "/teacher-announcements",
    },
  ],
  logout: {
    icon: <LogoutIcon />,
    label: "Cerrar Sesión",
    onClick: () => {},
  },
};
