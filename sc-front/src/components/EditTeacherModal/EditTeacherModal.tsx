import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import Modal from "../Modal/Modal";
import Select from "../Select/Select";
import type { SelectOption } from "../Select/Select";
import {
  getCourseSubjects,
  getTeacherWithAssignments,
  assignTeacherToCourse,
  removeTeacherFromCourse,
  type Teacher,
  type CourseSubject,
} from "../../services/teacher.service";
import "./EditTeacherModal.css";

export interface EditTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId: number;
}

export default function EditTeacherModal({
  isOpen,
  onClose,
  teacherId,
}: EditTeacherModalProps): ReactElement | null {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [courseSubjects, setCourseSubjects] = useState<CourseSubject[]>([]);
  const [selectedCs, setSelectedCs] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && teacherId) {
      loadData(teacherId);
    }
  }, [isOpen, teacherId]);

  const loadData = async (id: number) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const [teacherData, csData] = await Promise.all([
        getTeacherWithAssignments(id),
        getCourseSubjects(),
      ]);
      setTeacher(teacherData);
      setCourseSubjects(csData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedCs || !teacher) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await assignTeacherToCourse(teacher.id, parseInt(selectedCs));
      setSuccess("Profesor asignado correctamente");
      setSelectedCs("");
      // Recargar datos
      const updatedTeacher = await getTeacherWithAssignments(teacher.id);
      setTeacher(updatedTeacher);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al asignar");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (tcId: number) => {
    if (!teacher) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await removeTeacherFromCourse(tcId);
      setSuccess("Asignación eliminada correctamente");
      // Recargar datos
      const updatedTeacher = await getTeacherWithAssignments(teacher.id);
      setTeacher(updatedTeacher);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTeacher(null);
    setCourseSubjects([]);
    setSelectedCs("");
    setError(null);
    setSuccess(null);
    onClose();
  };

  // Generar opciones para el select combinando curso + materia
  const csOptions: SelectOption[] = courseSubjects.map((cs) => ({
    value: cs.id,
    label: `${cs.course?.name || "Curso"} - ${cs.subject?.name || "Materia"}`,
  }));

  const currentAssignments = teacher?.teacher_courses || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Editar Profesor: ${teacher?.lastname || ""} ${teacher?.name || ""}`}
      footer={
        <>
          <button className="edit-modal-btn edit-modal-btn--secondary" onClick={handleClose}>
            Cancelar
          </button>
          <button
            className="edit-modal-btn edit-modal-btn--primary"
            onClick={handleAssign}
            disabled={!selectedCs || loading}
          >
            {loading ? "Guardando..." : "Asignar"}
          </button>
        </>
      }
    >
      <div className="edit-modal">
        {/* Información del profesor */}
        <div className="edit-modal__info">
          <div className="edit-modal__info-row">
            <span className="edit-modal__label">DNI:</span>
            <span className="edit-modal__value">{teacher?.dni || "-"}</span>
          </div>
          <div className="edit-modal__info-row">
            <span className="edit-modal__label">Email:</span>
            <span className="edit-modal__value">{teacher?.email || "-"}</span>
          </div>
        </div>

        {/* Asignar nueva materia */}
        <div className="edit-modal__section">
          <h3 className="edit-modal__section-title">Asignar Curso/Materia</h3>
          <Select
            id="course-subject"
            name="course-subject"
            value={selectedCs}
            options={csOptions}
            onChange={(e) => setSelectedCs(e.target.value)}
            placeholder="Seleccionar curso y materia"
            disabled={loading}
          />
        </div>

        {/* Asignaciones actuales */}
        <div className="edit-modal__section">
          <h3 className="edit-modal__section-title">Asignaciones Actuales</h3>
          {loading && !success && !error && (
            <p className="edit-modal__loading">Cargando...</p>
          )}
          {currentAssignments.length === 0 ? (
            <p className="edit-modal__empty">
              No tiene asignaciones
            </p>
          ) : (
            <ul className="edit-modal__assignments">
              {currentAssignments.map((assignment) => (
                <li key={assignment.id} className="edit-modal__assignment-item">
                  <div className="edit-modal__assignment-info">
                    <span className="edit-modal__assignment-course">
                      {assignment.cs?.course?.name}
                    </span>
                    <span className="edit-modal__assignment-subject">
                      {assignment.cs?.subject?.name}
                    </span>
                  </div>
                  <button
                    className="edit-modal__remove-btn"
                    onClick={() => handleRemove(assignment.id)}
                    disabled={loading}
                    aria-label="Eliminar asignación"
                  >
                    🗑
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Mensajes de error/éxito */}
        {error && (
          <div className="edit-modal__message edit-modal__message--error">
            {error}
          </div>
        )}
        {success && (
          <div className="edit-modal__message edit-modal__message--success">
            {success}
          </div>
        )}
      </div>
    </Modal>
  );
}
