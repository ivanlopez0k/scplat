import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import Modal from "../Modal/Modal";
import {
  getCourses,
  getSubjects,
  deleteCourse,
  deleteSubject,
  type Course,
  type Subject,
} from "../../services/teacher.service";
import "./ManageSubjectsModal.css";

export interface ManageSubjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ManageSubjectsModal({
  isOpen,
  onClose,
}: ManageSubjectsModalProps): ReactElement | null {
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"courses" | "subjects">("subjects");

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const [coursesData, subjectsData] = await Promise.all([
        getCourses(),
        getSubjects(),
      ]);
      setCourses(coursesData);
      setSubjects(subjectsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (id: number, name: string) => {
    if (!confirm(`⚠️ ¿Estás seguro de eliminar la materia "${name}"?\n\nSe eliminarán también todas las asignaciones de cursos y profesores asociadas a esta materia.`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await deleteSubject(id);
      setSuccess(`Materia "${name}" eliminada correctamente`);
      // Recargar datos
      const subjectsData = await getSubjects();
      setSubjects(subjectsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar materia");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id: number, name: string, year: string) => {
    if (!confirm(`⚠️ ¿Estás seguro de eliminar el curso "${year}° ${name}"?\n\nSe eliminarán también todas las asignaciones de materias y profesores asociadas a este curso.`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await deleteCourse(id);
      setSuccess(`Curso "${year}° ${name}" eliminado correctamente`);
      // Recargar datos
      const coursesData = await getCourses();
      setCourses(coursesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar curso");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCourses([]);
    setSubjects([]);
    setError(null);
    setSuccess(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Gestionar Cursos y Materias"
      footer={
        <button className="manage-subjects-btn" onClick={handleClose}>
          Cerrar
        </button>
      }
    >
      <div className="manage-subjects">
        {/* Tabs */}
        <div className="manage-subjects__tabs">
          <button
            className={`manage-subjects__tab ${activeTab === "subjects" ? "manage-subjects__tab--active" : ""}`}
            onClick={() => setActiveTab("subjects")}
          >
            Materias
          </button>
          <button
            className={`manage-subjects__tab ${activeTab === "courses" ? "manage-subjects__tab--active" : ""}`}
            onClick={() => setActiveTab("courses")}
          >
            Cursos
          </button>
        </div>

        {/* Content */}
        <div className="manage-subjects__content">
          {activeTab === "subjects" && (
            <div className="manage-subjects__list">
              <h3 className="manage-subjects__subtitle">Listado de Materias</h3>
              {loading && !success && !error && (
                <p className="manage-subjects__loading">Cargando...</p>
              )}
              {subjects.length === 0 ? (
                <p className="manage-subjects__empty">No hay materias registradas</p>
              ) : (
                <ul className="manage-subjects__items">
                  {subjects.map((subject) => (
                    <li key={subject.id} className="manage-subjects__item">
                      <span className="manage-subjects__item-name">{subject.name}</span>
                      <button
                        className="manage-subjects__delete-btn"
                        onClick={() => handleDeleteSubject(subject.id, subject.name)}
                        disabled={loading}
                        aria-label={`Eliminar ${subject.name}`}
                      >
                        🗑 Eliminar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "courses" && (
            <div className="manage-subjects__list">
              <h3 className="manage-subjects__subtitle">Listado de Cursos</h3>
              {loading && !success && !error && (
                <p className="manage-subjects__loading">Cargando...</p>
              )}
              {courses.length === 0 ? (
                <p className="manage-subjects__empty">No hay cursos registrados</p>
              ) : (
                <ul className="manage-subjects__items">
                  {courses.map((course) => (
                    <li key={course.id} className="manage-subjects__item">
                      <span className="manage-subjects__item-name">
                        {course.year}° {course.name}
                      </span>
                      <button
                        className="manage-subjects__delete-btn"
                        onClick={() => handleDeleteCourse(course.id, course.name, course.year)}
                        disabled={loading}
                        aria-label={`Eliminar ${course.year}° ${course.name}`}
                      >
                        🗑 Eliminar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="manage-subjects__message manage-subjects__message--error">
            {error}
          </div>
        )}
        {success && (
          <div className="manage-subjects__message manage-subjects__message--success">
            {success}
          </div>
        )}
      </div>
    </Modal>
  );
}
