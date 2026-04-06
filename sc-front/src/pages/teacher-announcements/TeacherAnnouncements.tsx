import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { logout, checkAuth } from "../../services/auth.service";
import { Sidebar, useSidebarConfig } from "../../components/Sidebar";
import { useTheme } from "../../contexts/ThemeContext";
import { MoonIcon, SunIcon } from "../../components/Icons/ThemeIcons";
import { getMyAssignments, type Teacher, type TeacherAssignment } from "../../services/teacher.service";
import {
  createAnnouncement,
  getTeacherAnnouncements,
  deleteAnnouncement,
  type Announcement,
} from "../../services/announcement.service";
import "./TeacherAnnouncements.css";

/* ── Grid background ── */
const GridBackground = (): ReactElement => (
  <svg className="teacher-announcements__grid-bg" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="teacher-announcements-grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#b0b8c1" strokeWidth="0.7" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#teacher-announcements-grid)" />
  </svg>
);

interface CourseOption {
  csId: number;
  label: string;
}

export default function TeacherAnnouncements(): ReactElement {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [userName, setUserName] = useState("");
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCourseId, setFormCourseId] = useState<number | "">("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const status = await checkAuth();
      if (status.user) {
        setUserName(status.user.name);
        setTeacherId(status.user.id ?? null);

        if (status.user.id) {
          try {
            const teacher: Teacher = await getMyAssignments();
            const courses = (teacher.teacher_courses ?? []).map((a: TeacherAssignment) => ({
              csId: a.cs_id,
              label: a.cs?.course
                ? `${a.cs.course.year}° ${a.cs.course.name} – ${a.cs?.subject?.name ?? ""}`
                : `Curso #${a.cs_id}`,
            }));
            setCourseOptions(courses);

            // Fetch existing announcements
            setAnnouncementsLoading(true);
            const fetched = await getTeacherAnnouncements(status.user!.id!);
            // Sort newest first
            fetched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setAnnouncements(fetched);
          } catch (err) {
            console.error('Error fetching teacher data:', err);
          } finally {
            setAnnouncementsLoading(false);
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

  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormCourseId("");
    setFormError(null);
    setFormSuccess(null);
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formTitle.trim()) {
      setFormError("El título es obligatorio");
      return;
    }
    if (!formDescription.trim()) {
      setFormError("La descripción es obligatoria");
      return;
    }
    if (formCourseId === "") {
      setFormError("Seleccioná un curso");
      return;
    }
    if (teacherId === null) {
      setFormError("Error: no se pudo identificar al docente");
      return;
    }

    setCreating(true);
    try {
      const created = await createAnnouncement({
        title: formTitle.trim(),
        description: formDescription.trim(),
        course_id: formCourseId as number,
        teacher_id: teacherId,
      });

      setAnnouncements((prev) => [created, ...prev]);
      resetForm();
      setFormSuccess("Comunicado creado exitosamente");
    } catch (err: any) {
      const msg = err?.message || "Error al crear el comunicado";
      setFormError(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAnnouncement = async (id: number, title: string) => {
    const confirmed = window.confirm(`¿Estás seguro de que querés eliminar el comunicado "${title}"?`);
    if (!confirmed) return;

    setDeleteError(null);
    try {
      await deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      const msg = err?.message || "Error al eliminar el comunicado";
      setDeleteError(msg);
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCourseLabel = (announcement: Announcement): string => {
    if (announcement.course) {
      const subjectPart = announcement.subject ? ` – ${announcement.subject.name}` : "";
      return `${announcement.course.year}° ${announcement.course.name}${subjectPart}`;
    }
    // Fallback: match from courseOptions
    const match = courseOptions.find((c) => c.csId === announcement.course_id);
    return match ? match.label : `Curso #${announcement.course_id}`;
  };

  return (
    <div className="teacher-announcements">
      <GridBackground />
      <Sidebar config={sidebarConfig} />
      <div className="teacher-announcements__main">
        <header className="teacher-announcements__header">
          <h1 className="teacher-announcements__title">Comunicados — {userName}</h1>
          <div className="teacher-announcements__actions">
            <button className="teacher-announcements__icon-btn" aria-label="Cambiar tema" onClick={toggleTheme} title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}>
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
            <button className="teacher-announcements__icon-btn" aria-label="Notificaciones">🔔</button>
            <div className="teacher-announcements__avatar" />
          </div>
        </header>

        <div className="teacher-announcements__content">
          {loading ? (
            <div className="teacher-announcements__loading">Cargando...</div>
          ) : (
            <>
              {/* ── Create Form ── */}
              <section className="teacher-announcements__create-section">
                <h2 className="teacher-announcements__create-title">Nuevo comunicado</h2>
                <form className="teacher-announcements__form" onSubmit={handleCreateAnnouncement}>
                  <div className="teacher-announcements__form-group">
                    <label className="teacher-announcements__label" htmlFor="ann-title">
                      Título
                    </label>
                    <input
                      id="ann-title"
                      className="teacher-announcements__input"
                      type="text"
                      placeholder="Ej: Reunión de padres"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      disabled={creating}
                    />
                  </div>

                  <div className="teacher-announcements__form-group">
                    <label className="teacher-announcements__label" htmlFor="ann-description">
                      Descripción
                    </label>
                    <textarea
                      id="ann-description"
                      className="teacher-announcements__textarea"
                      placeholder="Escribí el contenido del comunicado..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      disabled={creating}
                    />
                  </div>

                  <div className="teacher-announcements__form-group">
                    <label className="teacher-announcements__label" htmlFor="ann-course">
                      Curso
                    </label>
                    <select
                      id="ann-course"
                      className="teacher-announcements__select"
                      value={formCourseId}
                      onChange={(e) => setFormCourseId(e.target.value === "" ? "" : Number(e.target.value))}
                      disabled={creating || courseOptions.length === 0}
                    >
                      <option value="">Seleccioná un curso</option>
                      {courseOptions.map((opt) => (
                        <option key={opt.csId} value={opt.csId}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formError && (
                    <div className="teacher-announcements__form-error">{formError}</div>
                  )}
                  {formSuccess && (
                    <div className="teacher-announcements__form-success">{formSuccess}</div>
                  )}

                  <button
                    type="submit"
                    className="teacher-announcements__btn"
                    disabled={creating}
                  >
                    {creating ? "Creando..." : "Crear comunicado"}
                  </button>
                </form>
              </section>

              {/* ── Announcements List ── */}
              <section className="teacher-announcements__list-section">
                <h2 className="teacher-announcements__list-title">Mis comunicados</h2>

                {deleteError && (
                  <div className="teacher-announcements__form-error">{deleteError}</div>
                )}

                {announcementsLoading ? (
                  <div className="teacher-announcements__loading">Cargando comunicados...</div>
                ) : announcements.length === 0 ? (
                  <div className="teacher-announcements__empty">
                    <p className="teacher-announcements__empty-icon">📢</p>
                    <h2 className="teacher-announcements__empty-title">Sin comunicados</h2>
                    <p className="teacher-announcements__empty-desc">
                      Aún no creaste ningún comunicado. Usá el formulario de arriba para crear el primero.
                    </p>
                  </div>
                ) : (
                  announcements.map((ann) => (
                    <article key={ann.id} className="teacher-announcements__card">
                      <div className="teacher-announcements__card-header">
                        <h3 className="teacher-announcements__card-title">{ann.title}</h3>
                        <button
                          className="teacher-announcements__card-delete-btn"
                          aria-label={`Eliminar comunicado "${ann.title}"`}
                          onClick={() => handleDeleteAnnouncement(ann.id, ann.title)}
                        >
                          🗑
                        </button>
                      </div>
                      <div className="teacher-announcements__card-meta">
                        <span className="teacher-announcements__card-course">
                          {getCourseLabel(ann)}
                        </span>
                        <span>{formatDate(ann.created_at)}</span>
                      </div>
                      {ann.description && (
                        <p className="teacher-announcements__card-description">{ann.description}</p>
                      )}
                    </article>
                  ))
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
