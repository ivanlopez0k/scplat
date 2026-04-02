import { useEffect, useState, useRef } from "react";
import type { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/auth.service";
import SubjectCard from "../../components/SubjectCard/SubjectCard";
import ExamRow from "../../components/ExamRow/ExamRow";
import "./dashboard.css";

/* ── Grid background ── */
const GridBackground = (): ReactElement => (
  <svg className="dash-grid-bg" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="dash-grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#b0b8c1" strokeWidth="0.7" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dash-grid)" />
  </svg>
);

/* ── Hardcoded data ── */
const SUBJECTS = [
  { name: "Matemática", grade: 8.5 },
  { name: "Lengua", grade: 6.2 },
  { name: "Historia", grade: 3.8 },
  { name: "Inglés", grade: 9.5 },
];

const EXAMS = [
  { subject: "Parcial Historia", detail: "Unidades 3 y 4", dateLabel: "13 mar" },
  { subject: "Matemática", detail: "Trigonometría 2", dateLabel: "23 mar" },
  { subject: "Inglés", detail: "Unidad 3", dateLabel: "01 abr" },
];

const COMUNICADOS = [
  {
    title: "Feriado",
    isNew: true,
    date: "27/03/26",
    desc: "El lunes 31/03 no habrá clases por feriado nacional. Se retoman actividades el martes 1/04.",
  },
  {
    title: "Cambio de aula",
    isNew: false,
    date: "12/03/26",
    desc: "La clase de Lengua del jueves 27/03 se dictará en el aula 12 por refacción del aula habitual.",
  },
  {
    title: "Material Nuevo",
    isNew: false,
    date: "27/02/26",
    desc: "Se subió el resumen de la unidad 5 de Ciencias Naturales. Ya está disponible en Mis Materias.",
  },
];

/* ── Calendar helpers ── */
const DAY_NAMES = ["D", "L", "M", "M", "J", "V", "S"];

function buildCalendar(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells: { day: number; current: boolean }[] = [];

  for (let i = startDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrev - i, current: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true });
  }
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, current: false });
    }
  }

  return cells;
}

/* ── SVG Icons ── */
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

const MessageIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 17l1.41-1.41L8.83 13H20v-2H8.83l2.58-2.59L10 7l-5 5 5 5zM4 5h8V3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8v-2H4V5z"/>
  </svg>
);

/* ── Sidebar links ── */
const NAV_LINKS = [
  { icon: <DashboardIcon />, label: "Dashboard", active: true },
  { icon: <BookIcon />, label: "Mis materias", active: false },
  { icon: <GradeIcon />, label: "Mis notas", active: false },
  { icon: <CalendarIcon />, label: "Calendario", active: false },
  { icon: <MessageIcon />, label: "Mensajes", active: false },
];

export default function Dashboard(): ReactElement {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [cardOffset, setCardOffset] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const today = 13;
  const calCells = buildCalendar(2026, 2);

  const handleArrow = () => {
    if (!cardsRef.current) return;
    const cardWidth = 200 + 16; // card min-width + gap
    const maxOffset = Math.max(0, SUBJECTS.length * cardWidth - (cardsRef.current.parentElement?.clientWidth ?? 600));
    const next = cardOffset + cardWidth;
    setCardOffset(next >= maxOffset ? 0 : next);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={`dash ${visible ? "" : ""}`}>
      <GridBackground />

      {/* ── SIDEBAR ── */}
      <aside className="dash-sidebar">
        <div className="dash-sidebar__logo">EducAR</div>

        <nav className="dash-sidebar__nav">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href="#"
              className={`dash-sidebar__link ${link.active ? "dash-sidebar__link--active" : ""}`}
            >
              <span className="dash-sidebar__link-icon">{link.icon}</span>
              <span>{link.label}</span>
            </a>
          ))}
        </nav>

        <button className="dash-sidebar__logout" onClick={handleLogout}>
          <span className="dash-sidebar__link-icon"><LogoutIcon /></span>
          <span>Cerrar Sesión</span>
        </button>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="dash-main">
        {/* Header */}
        <header className="dash-header">
          <div>
            <h1 className="dash-header__greeting">Hola, Pedro</h1>
            <p className="dash-header__info">5to grado, Turno Mañana</p>
          </div>
          <div className="dash-header__actions">
            <button className="dash-header__icon-btn" aria-label="Configuración">⚙</button>
            <button className="dash-header__icon-btn" aria-label="Notificaciones">🔔</button>
            <div className="dash-header__avatar" />
          </div>
        </header>

        {/* ── TOP ROW: Rendimiento + Comunicados ── */}
        <div className="dash-top-row">
          {/* Rendimiento */}
          <div className="dash-subjects">
            <h2 className="dash-section-title">Tu rendimiento por materia</h2>
            <div className="dash-subjects__scroll">
              <div
                className="dash-subjects__cards"
                ref={cardsRef}
                style={{ transform: `translateX(-${cardOffset}px)` }}
              >
                {SUBJECTS.map((s) => (
                  <SubjectCard key={s.name} name={s.name} grade={s.grade} />
                ))}
              </div>
              <button className="dash-subjects__arrow" aria-label="Ver más" onClick={handleArrow}>
                ›
              </button>
            </div>
            <a className="dash-subjects__link" href="#">Ver todas las materias</a>
          </div>

          {/* Comunicados */}
          <div className="dash-comunicados">
            <h3 className="dash-comunicados__title">Comunicados</h3>
            <div className="dash-comunicados__list">
              {COMUNICADOS.map((c) => (
                <div className="dash-com-item" key={c.title}>
                  <div className="dash-com-item__header">
                    <span className="dash-com-item__name">{c.title}</span>
                    {c.isNew && <span className="dash-com-item__badge">¡Nuevo!</span>}
                    <span className="dash-com-item__date">{c.date}</span>
                  </div>
                  <p className="dash-com-item__desc">{c.desc}</p>
                </div>
              ))}
            </div>
            <div className="dash-comunicados__more">
              <button className="dash-comunicados__more-btn" aria-label="Ver más comunicados">⌄</button>
            </div>
          </div>
        </div>

        {/* ── BOTTOM ROW: Evaluaciones+Calendario + Dudas ── */}
        <div className="dash-bottom-row">
          {/* Evaluaciones + Calendario combined */}
          <div className="dash-exams-cal">
            <div className="dash-exams">
              <h2 className="dash-section-title">Próximas evaluaciones</h2>
              {EXAMS.map((e) => (
                <ExamRow key={e.subject + e.dateLabel} subject={e.subject} detail={e.detail} dateLabel={e.dateLabel} />
              ))}
            </div>

            <div className="dash-calendar">
              <div className="dash-cal__header">
                <span className="dash-cal__month">Marzo 2026</span>
                <div className="dash-cal__nav">
                  <button className="dash-cal__nav-btn" aria-label="Mes anterior">‹</button>
                  <button className="dash-cal__nav-btn" aria-label="Mes siguiente">›</button>
                </div>
              </div>
              <div className="dash-cal__grid">
                {DAY_NAMES.map((d, i) => (
                  <span className="dash-cal__day-name" key={i}>{d}</span>
                ))}
                {calCells.map((cell, i) => (
                  <span
                    key={i}
                    className={`dash-cal__day ${!cell.current ? "dash-cal__day--other" : ""} ${cell.current && cell.day === today ? "dash-cal__day--today" : ""}`}
                  >
                    {cell.day}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ¿Tenes dudas? */}
          <div className="dash-dudas">
            <h3 className="dash-dudas__title">¿Tenés dudas?</h3>
            <p className="dash-dudas__desc">
              Podés escribirle un mensaje directo a tu docente
            </p>
            <button className="dash-dudas__btn">
              Enviar un mensaje <span>💬</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
