import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import Modal from "../Modal/Modal";
import Select from "../Select/Select";
import type { SelectOption } from "../Select/Select";
import {
  getCourses,
  getSubjects,
  getCourseSubjects,
  getTeacherWithAssignments,
  assignTeacherToCourse,
  removeTeacherFromCourse,
  createCourseSubject,
  type Teacher,
  type CourseSubject,
  type Course,
  type Subject,
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
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courseSubjects, setCourseSubjects] = useState<CourseSubject[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedExistingCs, setSelectedExistingCs] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateNew, setShowCreateNew] = useState(false);

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
      const [teacherData, coursesData, subjectsData, csData] = await Promise.all([
        getTeacherWithAssignments(id),
        getCourses(),
        getSubjects(),
        getCourseSubjects(),
      ]);
      setTeacher(teacherData);
      setCourses(coursesData);
      setSubjects(subjectsData);
      setCourseSubjects(csData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourseSubject = async () => {
    if (!selectedCourseId || !selectedSubjectId) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const newCs = await createCourseSubject(
        parseInt(selectedCourseId),
        parseInt(selectedSubjectId)
      );
      setSuccess("Curso/Materia creado correctamente");
      setSelectedCourseId("");
      setSelectedSubjectId("");
      setShowCreateNew(false);
      // Recargar course-subjects
      const csData = await getCourseSubjects();
      setCourseSubjects(csData);
      // Seleccionar el nuevo course-subject
      setSelectedExistingCs(newCs.id.toString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear curso/materia");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedExistingCs || !teacher) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await assignTeacherToCourse(teacher.id, parseInt(selectedExistingCs));
      setSuccess("Profesor asignado correctamente");
      setSelectedExistingCs("");
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
    setCourses([]);
    setSubjects([]);
    setCourseSubjects([]);
    setSelectedCourseId("");
    setSelectedSubjectId("");
    setSelectedExistingCs("");
    setError(null);
    setSuccess(null);
    setShowCreateNew(false);
    onClose();
  };

  // Generar opciones para los selects
  const courseOptions: SelectOption[] = courses.map((course) => ({
    value: course.id,
    label: `${course.name} (${course.year}°)`,
  }));

  const subjectOptions: SelectOption[] = subjects.map((subject) => ({
    value: subject.id,
    label: subject.name,
  }));

  // Generar opciones para el select de course-subjects existentes
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
            disabled={!selectedExistingCs || loading}
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

        {/* Asignar existente o crear nuevo */}
        <div className="edit-modal__section">
          <h3 className="edit-modal__section-title">Asignar Curso/Materia</h3>
          
          {/* Toggle para crear nuevo o usar existente */}
          <div className="edit-modal__toggle">
            <button
              className={`edit-modal__toggle-btn ${!showCreateNew ? "edit-modal__toggle-btn--active" : ""}`}
              onClick={() => setShowCreateNew(false)}
              type="button"
            >
              Usar existente
            </button>
            <button
              className={`edit-modal__toggle-btn ${showCreateNew ? "edit-modal__toggle-btn--active" : ""}`}
              onClick={() => setShowCreateNew(true)}
              type="button"
            >
              Crear nuevo
            </button>
          </div>

          {showCreateNew ? (
            /* Crear nuevo Course-Subject */
            <div className="edit-modal__create-new">
              <p className="edit-modal__hint">
                Primero seleccioná un curso y una materia para crear una nueva combinación:
              </p>
              <div className="edit-modal__row">
                <div className="edit-modal__field">
                  <label htmlFor="course" className="edit-modal__field-label">
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
                <div className="edit-modal__field">
                  <label htmlFor="subject" className="edit-modal__field-label">
                    Materia
                  </label>
                  <Select
                    id="subject"
                    name="subject"
                    value={selectedSubjectId}
                    options={subjectOptions}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    placeholder="Seleccionar materia"
                    disabled={loading}
                  />
                </div>
              </div>
              <button
                className="edit-modal-btn edit-modal-btn--create"
                onClick={handleCreateCourseSubject}
                disabled={!selectedCourseId || !selectedSubjectId || loading}
              >
                {loading ? "Creando..." : "Crear Curso/Materia"}
              </button>
            </div>
          ) : (
            /* Seleccionar Course-Subject existente */
            <div className="edit-modal__field">
              <label htmlFor="existing-cs" className="edit-modal__field-label">
                Curso/Materia disponible
              </label>
              <Select
                id="existing-cs"
                name="existing-cs"
                value={selectedExistingCs}
                options={csOptions}
                onChange={(e) => setSelectedExistingCs(e.target.value)}
                placeholder="Seleccionar curso y materia"
                disabled={loading}
              />
            </div>
          )}
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
