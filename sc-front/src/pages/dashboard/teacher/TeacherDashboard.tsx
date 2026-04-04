import { useEffect, useState, useRef } from "react";
import type { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { logout, checkAuth } from "../../../services/auth.service";
import { Sidebar, useSidebarConfig } from "../../../components/Sidebar";
import { getMyAssignments, type Teacher, type TeacherAssignment } from "../../../services/teacher.service";
import TeacherCourseCard from "../../../components/TeacherCourseCard/TeacherCourseCard";
import "./TeacherDashboard.css";

/* ── Grid background ── */
const GridBackground = (): ReactElement => (
  <svg className="teacher-dash-grid-bg" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="teacher-dash-grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#b0b8c1" strokeWidth="0.7" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#teacher-dash-grid)" />
  </svg>
);

export default function TeacherDashboard(): ReactElement {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCsId, setSelectedCsId] = useState<number | null>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const status = await checkAuth();
      if (status.user) {
        setUserName(status.user.name);

        if (status.user.id) {
          try {
            const teacher: Teacher = await getMyAssignments();
            setAssignments(teacher.teacher_courses ?? []);
          } catch (err) {
            console.error('Error fetching teacher assignments:', err);
          }
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sidebarConfig = useSidebarConfig("teacher", {
    onLogout: handleLogout,
  });

  const handleCourseClick = (csId: number) => {
    setSelectedCsId(csId);
  };

  const handleBack = () => {
    setSelectedCsId(null);
  };

  // If a course is selected, show detail view
  if (selectedCsId !== null) {
    const assignment = assignments.find((a) => a.cs_id === selectedCsId);
    if (!assignment) {
      setSelectedCsId(null);
      return <></>;
    }

    const courseName = assignment.cs?.course
      ? `${assignment.cs.course.year}° ${assignment.cs.course.name}`
      : 'Curso';
    const subjectName = assignment.cs?.subject?.name ?? 'Materia';

    return (
      <div className="teacher-dash">
        <GridBackground />
        <Sidebar config={sidebarConfig} />
        <div className="teacher-dash-main">
          <header className="teacher-dash-header">
            <div>
              <button className="teacher-dash-back-btn" onClick={handleBack}>
                ‹ Volver a Cursos
              </button>
              <h1 className="teacher-dash-header__title">{subjectName}</h1>
              <p className="teacher-dash-header__subtitle">{courseName}</p>
            </div>
            <div className="teacher-dash-header__actions">
              <button className="teacher-dash-header__icon-btn" aria-label="Configuración">⚙</button>
              <button className="teacher-dash-header__icon-btn" aria-label="Notificaciones">🔔</button>
              <div className="teacher-dash-header__avatar" />
            </div>
          </header>

          <div className="teacher-dash-content">
            <div className="teacher-dash-empty">
              <p className="teacher-dash-empty__icon">📋</p>
              <h2 className="teacher-dash-empty__title">Vista de materia</h2>
              <p className="teacher-dash-empty__desc">
                Aquí podrás gestionar notas, evaluaciones y alumnos de esta materia.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main courses view
  return (
    <div className="teacher-dash">
      <GridBackground />
      <Sidebar config={sidebarConfig} />
      <div className="teacher-dash-main">
        <header className="teacher-dash-header">
          <div>
            <h1 className="teacher-dash-header__greeting">Hola, {userName}</h1>
          </div>
          <div className="teacher-dash-header__actions">
            <button className="teacher-dash-header__icon-btn" aria-label="Configuración">⚙</button>
            <button className="teacher-dash-header__icon-btn" aria-label="Notificaciones">🔔</button>
            <div className="teacher-dash-header__avatar" />
          </div>
        </header>

        <div className="teacher-dash-content">
          {loading ? (
            <div className="teacher-dash-loading">Cargando cursos...</div>
          ) : assignments.length === 0 ? (
            <div className="teacher-dash-empty">
              <p className="teacher-dash-empty__icon">📚</p>
              <h2 className="teacher-dash-empty__title">Sin cursos asignados</h2>
              <p className="teacher-dash-empty__desc">
                El administrador aún no te asignó a ningún curso/materia.
              </p>
            </div>
          ) : (
            <div className="teacher-dash-courses-section">
              <h2 className="teacher-dash-courses-section__title">Tus cursos asignados</h2>
              <div className="teacher-dash-courses__scroll">
                <div
                  className="teacher-dash-courses__cards"
                  ref={cardsRef}
                >
                  {assignments.map((assignment) => {
                    const courseName = assignment.cs?.course
                      ? `${assignment.cs.course.year}° ${assignment.cs.course.name}`
                      : 'Curso';
                    const subjectName = assignment.cs?.subject?.name ?? 'Materia';
                    return (
                      <TeacherCourseCard
                        key={assignment.id}
                        subjectName={subjectName}
                        courseName={courseName}
                        onClick={() => handleCourseClick(assignment.cs_id)}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
