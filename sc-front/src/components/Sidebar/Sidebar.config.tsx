import type { SidebarConfig } from "./Sidebar.types";

// Icon components
const MessageIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
  </svg>
);

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

export const studentSidebarConfig: SidebarConfig = {
  logo: {
    src: "/Group_17.png",
    alt: "EducAR",
  },
  links: [
    {
      icon: <DashboardIcon />,
      label: "Dashboard",
      href: "#",
      active: true,
    },
    {
      icon: <BookIcon />,
      label: "Mis materias",
      href: "#",
    },
    {
      icon: <GradeIcon />,
      label: "Mis notas",
      href: "#",
    },
    {
      icon: <CalendarIcon />,
      label: "Calendario",
      href: "#",
    },
    {
      icon: <MessageIcon />,
      label: "Mensajes",
      href: "#",
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
  links: [
    {
      icon: <MessageIcon />,
      label: "Mensajes",
      href: "#",
    },
  ],
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
