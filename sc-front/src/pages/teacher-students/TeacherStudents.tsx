import { useEffect, useState, type ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { logout, checkAuth } from "../../services/auth.service";
import { Sidebar, useSidebarConfig } from "../../components/Sidebar";
import { useTheme } from "../../contexts/ThemeContext";
import { MoonIcon, SunIcon } from "../../components/Icons/ThemeIcons";
import {
  getMyAssignments,
  type Teacher,
  type TeacherAssignment,
} from "../../services/teacher.service";
import {
  getStudentsByCsId,
  type CourseSubjectDetail,
  type CourseSubjectStudent,
} from "../../services/student.service";
import "./TeacherStudents.css";

const GridBackground = (): ReactElement => (
  <svg className="teacher-students-grid-bg" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="teacher-students-grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#b0b8c1" strokeWidth="0.7" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#teacher-students-grid)" />
  </svg>
);

function noteColor(note: number): string {
  if (note >= 70) return "#16a34a";
  if (note >= 40) return "#eab308";
  return "#dc2626";
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
  });
}

export default function TeacherStudents(): ReactElement {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [userName, setUserName] = useState("");
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCsId, setSelectedCsId] = useState<number | null>(null);
  const [courseDetail, setCourseDetail] = useState<CourseSubjectDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

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
            console.error("Error fetching teacher assignments:", err);
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

  const handleSelectCourse = async (csId: number) => {
    setSelectedCsId(csId);
    setDetailLoading(true);
    try {
      const detail = await getStudentsByCsId(csId);
      setCourseDetail(detail);
    } catch (err) {
      console.error("Error fetching students:", err);
      setCourseDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedCsId(null);
    setCourseDetail(null);
  };

  // Calculate average for a student
  const getAverage = (student: CourseSubjectStudent): number | null => {
    if (student.grades.length === 0) return null;
    const sum = student.grades.reduce((acc, g) => acc + g.note, 0);
    return Math.round((sum / student.grades.length) * 10) / 10;
  };

  // Detail view: show students table
  if (selectedCsId !== null && courseDetail) {
    const courseName = `${courseDetail.course.year}° ${courseDetail.course.name}`;
    const allExams = new Set<string>();
    courseDetail.students.forEach((s) =>
      s.grades.forEach((g) => allExams.add(g.exam_id.toString()))
    );
    const examColumns = Array.from(allExams);

    return (
      <div className="teacher-students-page">
        <GridBackground />
        <Sidebar config={sidebarConfig} />

        <div className="teacher-students-main">
          <header className="teacher-students-header">
            <div>
              <button className="teacher-students-back-btn" onClick={handleBack}>
                ‹ Volver a Cursos
              </button>
              <h1 className="teacher-students-header__title">{courseDetail.subject.name}</h1>
              <p className="teacher-students-header__subtitle">{courseName} — {courseDetail.students.length} alumnos</p>
            </div>
            <div className="teacher-students-header__actions">
              <button className="teacher-students-header__icon-btn" aria-label="Cambiar tema" onClick={toggleTheme} title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}>
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
              <button className="teacher-students-header__icon-btn" aria-label="Notificaciones">🔔</button>
              <div className="teacher-students-header__avatar" />
            </div>
          </header>

          <div className="teacher-students-content">
            {detailLoading ? (
              <div className="teacher-students-content__loading">
                <div className="teacher-students-skeleton" />
                <div className="teacher-students-skeleton" />
                <div className="teacher-students-skeleton" />
              </div>
            ) : (
              <div className="teacher-students-table-wrap">
                <table className="teacher-students-table">
                  <thead>
                    <tr>
                      <th>Alumno</th>
                      <th>DNI</th>
                      {examColumns.map((eid) => {
                        const exam = courseDetail.students[0]?.grades.find(g => g.exam_id.toString() === eid);
                        return (
                          <th key={eid} className="teacher-students-table__exam-col">
                            {exam?.exam_title ?? `Evaluación ${eid}`}
                            <br />
                            <span className="teacher-students-table__exam-date">
                              {formatDate(exam?.exam_date ?? null)}
                            </span>
                          </th>
                        );
                      })}
                      <th>Promedio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseDetail.students.map((student) => {
                      const avg = getAverage(student);
                      return (
                        <tr key={student.student_id}>
                          <td className="teacher-students-table__name">
                            {student.lastname}, {student.name}
                          </td>
                          <td className="teacher-students-table__dni">{student.dni}</td>
                          {examColumns.map((eid) => {
                            const grade = student.grades.find(g => g.exam_id.toString() === eid);
                            return (
                              <td key={eid} className="teacher-students-table__grade">
                                {grade ? (
                                  <span style={{ color: noteColor(grade.note), fontWeight: 700 }}>
                                    {grade.note}
                                  </span>
                                ) : (
                                  <span className="teacher-students-table__no-grade">—</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="teacher-students-table__avg">
                            {avg !== null ? (
                              <span style={{ color: noteColor(avg), fontWeight: 700 }}>
                                {avg}
                              </span>
                            ) : (
                              <span className="teacher-students-table__no-grade">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main view: list of courses
  return (
    <div className="teacher-students-page">
      <GridBackground />
      <Sidebar config={sidebarConfig} />

      <div className="teacher-students-main">
        <header className="teacher-students-header">
          <div>
            <h1 className="teacher-students-header__greeting">Hola, {userName}</h1>
            <p className="teacher-students-header__subtitle">Seleccioná un curso para ver los alumnos</p>
          </div>
          <div className="teacher-students-header__actions">
            <button className="teacher-students-header__icon-btn" aria-label="Cambiar tema" onClick={toggleTheme} title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}>
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
            <button className="teacher-students-header__icon-btn" aria-label="Notificaciones">🔔</button>
            <div className="teacher-students-header__avatar" />
          </div>
        </header>

        <div className="teacher-students-content">
          {loading ? (
            <div className="teacher-students-content__loading">
              <div className="teacher-students-skeleton" />
              <div className="teacher-students-skeleton" />
              <div className="teacher-students-skeleton" />
            </div>
          ) : assignments.length === 0 ? (
            <div className="teacher-students-content__empty">
              <p className="teacher-students-content__empty-icon">📚</p>
              <h2>Sin cursos asignados</h2>
              <p>El administrador aún no te asignó a ningún curso/materia.</p>
            </div>
          ) : (
            <div className="teacher-students-grid">
              {assignments.map((assignment) => {
                const courseName = assignment.cs?.course
                  ? `${assignment.cs.course.year}° ${assignment.cs.course.name}`
                  : "Curso";
                const subjectName = assignment.cs?.subject?.name ?? "Materia";
                return (
                  <button
                    className="teacher-students-card"
                    key={assignment.id}
                    onClick={() => handleSelectCourse(assignment.cs_id)}
                  >
                    <span className="teacher-students-card__icon">👥</span>
                    <div className="teacher-students-card__info">
                      <h2 className="teacher-students-card__subject">{subjectName}</h2>
                      <p className="teacher-students-card__course">{courseName}</p>
                    </div>
                    <span className="teacher-students-card__arrow">›</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
