import { useEffect, useState, type ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { logout, checkAuth } from "../../services/auth.service";
import { Sidebar, useSidebarConfig } from "../../components/Sidebar";
import {
  getStudentGrades,
  type Grade,
} from "../../services/student.service";
import "./StudentGrades.css";

const GridBackground = (): ReactElement => (
  <svg className="grades-grid-bg" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="grades-grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#b0b8c1" strokeWidth="0.7" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grades-grid)" />
  </svg>
);

const TYPE_LABELS: Record<string, string> = {
  EXAMEN: "Examen",
  TP: "Trabajo Práctico",
  RECUPERATORIO: "Recuperatorio",
};

function noteColor(note: number): string {
  if (note >= 70) return "#16a34a";
  if (note >= 40) return "#eab308";
  return "#dc2626";
}

export default function StudentGrades(): ReactElement {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const status = await checkAuth();
      if (status.user) {
        setUserName(status.user.name);

        if (status.user.id && status.user.role === "student") {
          try {
            const studentGrades = await getStudentGrades(status.user.id);
            setGrades(studentGrades);
          } catch (err) {
            console.error("Error fetching grades:", err);
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

  const sidebarConfig = useSidebarConfig("student", {
    onLogout: handleLogout,
  });

  // Group grades by subject name
  const groupedGrades: Record<string, Grade[]> = {};
  grades.forEach((g) => {
    const subjectName = g.Exam?.Cs?.subject?.name ?? "Sin materia";
    if (!groupedGrades[subjectName]) groupedGrades[subjectName] = [];
    groupedGrades[subjectName].push(g);
  });

  return (
    <div className="grades-page">
      <GridBackground />
      <Sidebar config={sidebarConfig} />

      <div className="grades-main">
        <header className="grades-header">
          <div>
            <h1 className="grades-header__greeting">Hola, {userName}</h1>
            <p className="grades-header__subtitle">Mis notas</p>
          </div>
          <div className="grades-header__actions">
            <button className="grades-header__icon-btn" aria-label="Configuración">⚙</button>
            <button className="grades-header__icon-btn" aria-label="Notificaciones">🔔</button>
            <div className="grades-header__avatar" />
          </div>
        </header>

        <div className="grades-content">
          {loading ? (
            <div className="grades-content__loading">
              <div className="grades-skeleton" />
              <div className="grades-skeleton" />
              <div className="grades-skeleton" />
            </div>
          ) : grades.length === 0 ? (
            <div className="grades-content__empty">
              <p className="grades-content__empty-icon">📝</p>
              <h2>Sin notas aún</h2>
              <p>Aún no tienes calificaciones registradas.</p>
            </div>
          ) : (
            Object.entries(groupedGrades).map(([subjectName, subjectGrades]) => (
              <div className="grades-subject" key={subjectName}>
                <h2 className="grades-subject__title">{subjectName}</h2>
                <div className="grades-table-wrap">
                  <table className="grades-table">
                    <thead>
                      <tr>
                        <th>Evaluación</th>
                        <th>Tipo</th>
                        <th>Fecha</th>
                        <th>Nota</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjectGrades.map((g) => {
                        const date = g.Exam?.exam_date
                          ? new Date(g.Exam.exam_date).toLocaleDateString("es-AR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—";
                        const note = Number(g.note);
                        return (
                          <tr key={g.id}>
                            <td className="grades-table__exam">{g.Exam?.title ?? "—"}</td>
                            <td className="grades-table__type">
                              {g.Exam?.type ? TYPE_LABELS[g.Exam.type] ?? g.Exam.type : "—"}
                            </td>
                            <td className="grades-table__date">{date}</td>
                            <td className="grades-table__note" style={{ color: noteColor(note) }}>
                              {note}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
