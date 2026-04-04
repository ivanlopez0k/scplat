import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import Modal from "../Modal/Modal";
import Select, { type SelectOption } from "../Select/Select";
import { getCourses, type Course } from "../../services/course.service";
import {
  createEnrollment,
  getStudentEnrollments,
  deleteEnrollment,
  type Enrollment,
} from "../../services/enrollment.service";
import "./AssignStudentModal.css";

const CURRENT_SCHOOL_YEAR = new Date().getFullYear();

export interface AssignStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: number;
  studentName: string;
}

export default function AssignStudentModal({
  isOpen,
  onClose,
  studentId,
  studentName,
}: AssignStudentModalProps): ReactElement | null {
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentEnrollments, setCurrentEnrollments] = useState<Enrollment[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && studentId) {
      loadData(studentId);
    }
  }, [isOpen, studentId]);

  const loadData = async (id: number) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const [coursesData, enrollmentsData] = await Promise.all([
        getCourses(),
        getStudentEnrollments(id),
      ]);
      setCourses(coursesData);
      setCurrentEnrollments(enrollmentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedCourseId) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await createEnrollment(studentId, parseInt(selectedCourseId), CURRENT_SCHOOL_YEAR);
      setSuccess("Alumno asignado correctamente");
      setSelectedCourseId("");
      const enrollments = await getStudentEnrollments(studentId);
      setCurrentEnrollments(enrollments);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al asignar");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (enrollmentId: number) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await deleteEnrollment(enrollmentId);
      setSuccess("Inscripción eliminada correctamente");
      const enrollments = await getStudentEnrollments(studentId);
      setCurrentEnrollments(enrollments);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCourses([]);
    setCurrentEnrollments([]);
    setSelectedCourseId("");
    setError(null);
    setSuccess(null);
    onClose();
  };

  const courseOptions: SelectOption[] = courses.map((course) => ({
    value: course.id,
    label: `${course.year}° ${course.name}`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Asignar Curso: ${studentName}`}
      footer={
        <>
          <button className="assign-student-modal-btn assign-student-modal-btn--secondary" onClick={handleClose}>
            Cancelar
          </button>
          <button
            className="assign-student-modal-btn assign-student-modal-btn--primary"
            onClick={handleAssign}
            disabled={!selectedCourseId || loading}
          >
            {loading ? "Asignando..." : "Asignar"}
          </button>
        </>
      }
    >
      <div className="assign-student-modal">
        {/* Asignar curso */}
        <div className="assign-student-modal__section">
          <h3 className="assign-student-modal__section-title">Asignar a un curso</h3>
          <p className="assign-student-modal__hint">
            Año lectivo: <strong>{CURRENT_SCHOOL_YEAR}</strong>
          </p>
          <div className="assign-student-modal__field">
            <label htmlFor="course" className="assign-student-modal__field-label">
              Curso
            </label>
            <Select
              id="course"
              name="course"
              value={selectedCourseId}
              options={courseOptions}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              placeholder="Seleccionar curso"
              disabled={loading}
            />
          </div>
        </div>

        {/* Inscripciones actuales */}
        <div className="assign-student-modal__section">
          <h3 className="assign-student-modal__section-title">Inscripciones actuales</h3>
          {loading && currentEnrollments.length === 0 && (
            <p className="assign-student-modal__loading">Cargando...</p>
          )}
          {currentEnrollments.length === 0 ? (
            <p className="assign-student-modal__empty">
              No tiene inscripciones
            </p>
          ) : (
            <ul className="assign-student-modal__enrollments">
              {currentEnrollments.map((enrollment) => (
                <li key={enrollment.id} className="assign-student-modal__enrollment-item">
                  <div className="assign-student-modal__enrollment-info">
                    <span className="assign-student-modal__enrollment-course">
                      {enrollment.course ? `${enrollment.course.year}° ${enrollment.course.name}` : 'Sin curso'}
                    </span>
                    <span className="assign-student-modal__enrollment-year">
                      Año lectivo: {enrollment.school_year}
                    </span>
                  </div>
                  <button
                    className="assign-student-modal__remove-btn"
                    onClick={() => handleRemove(enrollment.id)}
                    disabled={loading}
                    aria-label="Eliminar inscripción"
                  >
                    🗑
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Mensajes */}
        {error && (
          <div className="assign-student-modal__message assign-student-modal__message--error">
            {error}
          </div>
        )}
        {success && (
          <div className="assign-student-modal__message assign-student-modal__message--success">
            {success}
          </div>
        )}
      </div>
    </Modal>
  );
}
