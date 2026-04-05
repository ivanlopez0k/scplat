import { useEffect, useState, useRef } from "react";
import type { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { logout, checkAuth } from "../../services/auth.service";
import { Sidebar, useSidebarConfig } from "../../components/Sidebar";
import SubjectCard from "../../components/SubjectCard/SubjectCard";
import { getStudentsByParent, type ParentStudentLink } from "../../services/parent.service";
import {
  getStudentEnrollment,
  getCourseSubjects,
  getStudentGrades,
  type CourseSubject,
  type Grade,
  type Enrollment,
} from "../../services/student.service";
import { getExamsForStudent, type Exam as ExamType } from "../../services/exam.service";
import AddChildModal from "../../components/AddChildModal/AddChildModal";
import ExamListCard from "../../components/ExamListCard/ExamListCard";
import ExamCalendar from "../../components/ExamCalendar/ExamCalendar";
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

export default function Dashboard(): ReactElement {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [cardOffset, setCardOffset] = useState(0);
  const [userRole, setUserRole] = useState<"student" | "teacher" | "parent" | "admin">("student");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState<number | null>(null);

  // Student-specific state
  const [studentCourse, setStudentCourse] = useState<string>("");
  const [studentSubjects, setStudentSubjects] = useState<{ name: string; average: number | null }[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [studentExams, setStudentExams] = useState<ExamType[]>([]);
  const [examsError, setExamsError] = useState<string | null>(null);

  // Parent-specific state
  const [children, setChildren] = useState<{ id: number; name: string; lastname: string }[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);
  const [parentChildSubjects, setParentChildSubjects] = useState<{ name: string; average: number | null }[]>([]);
  const [parentChildExams, setParentChildExams] = useState<ExamType[]>([]);
  const [parentChildExamsError, setParentChildExamsError] = useState<string | null>(null);

  // Fetch child data when selected child changes
  useEffect(() => {
    if (userRole === 'parent' && selectedChildId) {
      fetchChildData(selectedChildId);
    }
  }, [selectedChildId, userRole]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const status = await checkAuth();
      if (status.user) {
        setUserRole(status.user.role as any);
        setUserName(status.user.name);
        setUserId(status.user.id ?? null);

        // If parent, fetch children
        if (status.user.role === 'parent' && status.user.id) {
          try {
            const links = await getStudentsByParent(status.user.id);
            const kids = links.map((link: ParentStudentLink) => ({
              id: link.student_id,
              name: link.student?.name ?? '',
              lastname: link.student?.lastname ?? '',
            }));
            setChildren(kids);
            if (kids.length > 0) {
              setSelectedChildId(kids[0].id);
              // Fetch data for the first child
              await fetchChildData(kids[0].id);
            }
          } catch (err) {
            console.error('Error fetching children:', err);
            setChildren([]);
          }
        }

        // If student, fetch enrollment, subjects and grades
        if (status.user.role === 'student' && status.user.id) {
          try {
            setSubjectsLoading(true);
            const enrollments: Enrollment[] = await getStudentEnrollment(status.user.id);
            if (enrollments.length > 0) {
              const enrollment = enrollments[0];
              const courseName = enrollment.course
                ? `${enrollment.course.year}° ${enrollment.course.name}`
                : '';
              setStudentCourse(courseName);

              // Fetch subjects for this course (only if course exists)
              if (enrollment.course) {
                const subjects: CourseSubject[] = await getCourseSubjects(enrollment.course_id);
                const subjectNames = subjects.map((cs) => cs.subject?.name ?? 'Materia');

                // Fetch grades for this student
                const grades: Grade[] = await getStudentGrades(status.user.id);

                // Calculate average per subject
                const subjectsWithAvg = subjectNames.map((name) => {
                  const subjectGrades = grades.filter(
                    (g) => g.Exam?.Cs?.subject?.name === name
                  );
                  if (subjectGrades.length === 0) {
                    return { name, average: null };
                  }
                  const sum = subjectGrades.reduce((acc, g) => acc + Number(g.note), 0);
                  return { name, average: Math.round((sum / subjectGrades.length) * 10) / 10 };
                });

                setStudentSubjects(subjectsWithAvg);
              }

              // Fetch exams for this student
              console.log(`[Dashboard] Fetching exams for student id=${status.user.id}`);
              try {
                const exams = await getExamsForStudent(status.user.id);
                console.log(`[Dashboard] Received ${exams.length} exams:`, JSON.stringify(exams, null, 2));
                setStudentExams(exams);
              } catch (examErr: any) {
                const msg = examErr?.message || 'Error al cargar evaluaciones';
                console.error('[Dashboard] Error fetching exams:', msg);
                setExamsError(msg);
              }
            }
          } catch (err) {
            console.error('Error fetching student data:', err);
          } finally {
            setSubjectsLoading(false);
          }
        }
      }
    };
    fetchUser();
  }, []);

  // Fetch grades and exams for selected child (parent view)
  const fetchChildData = async (childId: number) => {
    if (!childId) return;
    setParentChildExamsError(null);

    try {
      const enrollments: Enrollment[] = await getStudentEnrollment(childId);
      if (enrollments.length > 0) {
        const enrollment = enrollments[0];

        // Fetch subjects for this course
        if (enrollment.course) {
          const subjects: CourseSubject[] = await getCourseSubjects(enrollment.course_id);
          const subjectNames = subjects.map((cs) => cs.subject?.name ?? 'Materia');

          // Fetch grades for this student
          const grades: Grade[] = await getStudentGrades(childId);

          // Calculate average per subject
          const subjectsWithAvg = subjectNames.map((name) => {
            const subjectGrades = grades.filter(
              (g) => g.Exam?.Cs?.subject?.name === name
            );
            if (subjectGrades.length === 0) {
              return { name, average: null };
            }
            const sum = subjectGrades.reduce((acc, g) => acc + Number(g.note), 0);
            return { name, average: Math.round((sum / subjectGrades.length) * 10) / 10 };
          });

          setParentChildSubjects(subjectsWithAvg);
        }

        // Fetch exams for this student
        try {
          const exams = await getExamsForStudent(childId);
          setParentChildExams(exams);
        } catch (examErr: any) {
          const msg = examErr?.message || 'Error al cargar evaluaciones';
          console.error('[Dashboard] Error fetching exams for child:', msg);
          setParentChildExamsError(msg);
        }
      }
    } catch (err) {
      console.error('Error fetching child data:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleAddChild = () => {
    setIsAddChildModalOpen(true);
  };

  const handleChildAdded = (child: { id: number; name: string; lastname: string }) => {
    setChildren((prev) => [...prev, child]);
    setSelectedChildId(child.id);
    fetchChildData(child.id);
    // Close modal after a short delay to let user see success message
    setTimeout(() => {
      setIsAddChildModalOpen(false);
    }, 1200);
  };

  const sidebarConfig = useSidebarConfig(userRole, {
    onLogout: handleLogout,
    onAddChild: handleAddChild,
  });

  const handleArrow = () => {
    if (!cardsRef.current) return;
    const cardWidth = 200 + 16;
    const data = userRole === 'student' ? studentSubjects : parentChildSubjects;
    if (data.length === 0) return;
    const maxOffset = Math.max(0, data.length * cardWidth - (cardsRef.current.parentElement?.clientWidth ?? 600));
    const next = cardOffset + cardWidth;
    setCardOffset(next >= maxOffset ? 0 : next);
  };

  const selectedChild = children.find((c) => c.id === selectedChildId);
  const selectedChildName = selectedChild
    ? `${selectedChild.lastname}, ${selectedChild.name}`
    : children.length > 0
      ? `${children[0].lastname}, ${children[0].name}`
      : null;

  return (
    <div className={`dash ${visible ? "" : ""}`}>
      <GridBackground />

      {/* ── SIDEBAR ── */}
      <Sidebar config={sidebarConfig} />

      {/* ── MAIN AREA ── */}
      <div className="dash-main">
        {/* Header */}
        <header className="dash-header">
          <div>
            <h1 className="dash-header__greeting">Hola, {userName}</h1>
            {userRole === 'parent' && selectedChildName && (
              <>
                <div className="dash-header__child-selector">
                  <label htmlFor="child-select" className="dash-header__child-label">
                    Rendimiento de
                  </label>
                  <select
                    id="child-select"
                    className="dash-header__child-select"
                    value={selectedChildId ?? children[0]?.id ?? ''}
                    onChange={(e) => {
                      const childId = Number(e.target.value);
                      setSelectedChildId(childId);
                      fetchChildData(childId);
                    }}
                  >
                    {children.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.lastname}, {child.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            {userRole === 'parent' && children.length === 0 && (
              <p className="dash-header__info">
                No tenés hijos vinculados aún. Usá "Agregar hijo" en el menú.
              </p>
            )}
            {userRole === 'student' && (
              <p className="dash-header__info">
                {subjectsLoading
                  ? 'Cargando...'
                  : studentCourse
                    ? studentCourse
                    : 'Sin curso asignado'}
              </p>
            )}
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
            <h2 className="dash-section-title">
              {userRole === 'parent' && selectedChildName
                ? `Rendimiento de ${selectedChildName}`
                : 'Tu rendimiento por materia'}
            </h2>
            <div className="dash-subjects__scroll">
              {userRole === 'student' && subjectsLoading ? (
                <p className="dash-subjects__loading">Cargando materias...</p>
              ) : (
                <div
                  className="dash-subjects__cards"
                  ref={cardsRef}
                  style={{ transform: `translateX(-${cardOffset}px)` }}
                >
                  {userRole === 'student'
                    ? studentSubjects.map((s) => (
                        <SubjectCard
                          key={s.name}
                          name={s.name}
                          grade={s.average ?? undefined}
                          noGrade={s.average === null}
                        />
                      ))
                    : parentChildSubjects.length > 0
                      ? parentChildSubjects.map((s) => (
                          <SubjectCard
                            key={s.name}
                            name={s.name}
                            grade={s.average ?? undefined}
                            noGrade={s.average === null}
                          />
                        ))
                      : []}
                </div>
              )}
              <button className="dash-subjects__arrow" aria-label="Ver más" onClick={handleArrow}>
                ›
              </button>
            </div>
            {userRole === 'student' && studentSubjects.length > 0 && (
              <a className="dash-subjects__link" href="#">Ver todas las materias</a>
            )}
            {userRole === 'student' && studentSubjects.length === 0 && !subjectsLoading && (
              <p className="dash-subjects__empty">
                No hay materias asignadas aún.
              </p>
            )}
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
              {userRole === 'student' && examsError && (
                <p className="dash-exams__error">Error: {examsError}</p>
              )}
              {userRole === 'parent' && parentChildExamsError && (
                <p className="dash-exams__error">Error: {parentChildExamsError}</p>
              )}
              <ExamListCard
                exams={userRole === 'student' ? studentExams : parentChildExams}
                loading={false}
                title="Próximas evaluaciones"
                emptyMessage="No hay evaluaciones próximas"
              />
            </div>

            <ExamCalendar exams={userRole === 'student' ? studentExams : parentChildExams} />
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

      {/* ── ADD CHILD MODAL ── */}
      {userId !== null && (
        <AddChildModal
          isOpen={isAddChildModalOpen}
          onClose={() => setIsAddChildModalOpen(false)}
          parentId={userId}
          onChildAdded={handleChildAdded}
        />
      )}
    </div>
  );
}
