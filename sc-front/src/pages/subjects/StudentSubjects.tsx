import { useEffect, useState, type ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { logout, checkAuth } from "../../services/auth.service";
import { Sidebar, useSidebarConfig } from "../../components/Sidebar";
import { getStudentSubjects, type StudentSubject } from "../../services/student.service";
import "./StudentSubjects.css";

const GridBackground = (): ReactElement => (
  <svg className="subjects-grid-bg" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="subjects-grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#b0b8c1" strokeWidth="0.7" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#subjects-grid)" />
  </svg>
);

export default function StudentSubjects(): ReactElement {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [subjects, setSubjects] = useState<StudentSubject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const status = await checkAuth();
      if (status.user) {
        setUserName(status.user.name);

        if (status.user.id && status.user.role === "student") {
          try {
            const studentSubjects = await getStudentSubjects(status.user.id);
            setSubjects(studentSubjects);
          } catch (err) {
            console.error("Error fetching subjects:", err);
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

  return (
    <div className="subjects-page">
      <GridBackground />
      <Sidebar config={sidebarConfig} />

      <div className="subjects-main">
        <header className="subjects-header">
          <div>
            <h1 className="subjects-header__greeting">Hola, {userName}</h1>
            <p className="subjects-header__subtitle">Mis materias</p>
          </div>
          <div className="subjects-header__actions">
            <button className="subjects-header__icon-btn" aria-label="Configuración">⚙</button>
            <button className="subjects-header__icon-btn" aria-label="Notificaciones">🔔</button>
            <div className="subjects-header__avatar" />
          </div>
        </header>

        <div className="subjects-content">
          {loading ? (
            <div className="subjects-content__loading">
              <div className="subjects-skeleton" />
              <div className="subjects-skeleton" />
              <div className="subjects-skeleton" />
            </div>
          ) : subjects.length === 0 ? (
            <div className="subjects-content__empty">
              <p className="subjects-content__empty-icon">📚</p>
              <h2>Sin materias asignadas</h2>
              <p>Aún no tienes materias asignadas a tu curso.</p>
            </div>
          ) : (
            <div className="subjects-grid">
              {subjects.map((subject) => (
                <div className="subject-card" key={subject.subject_id}>
                  <div className="subject-card__header">
                    <span className="subject-card__icon">📖</span>
                    <h2 className="subject-card__title">{subject.subject_name}</h2>
                  </div>
                  <div className="subject-card__teachers">
                    <p className="subject-card__teachers-label">Profesor{subject.teachers.length > 1 ? "es" : ""}:</p>
                    {subject.teachers.map((teacher) => (
                      <div className="subject-card__teacher" key={teacher.id}>
                        <div className="subject-card__teacher-avatar">
                          {teacher.name[0]}{teacher.lastname[0]}
                        </div>
                        <div className="subject-card__teacher-info">
                          <span className="subject-card__teacher-name">
                            {teacher.lastname}, {teacher.name}
                          </span>
                          <span className="subject-card__teacher-email">
                            {teacher.email}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
