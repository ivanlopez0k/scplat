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

const API_URL = '/api';
const NEW_OPTION_VALUE = "__NEW__";

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
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseYear, setNewCourseYear] = useState<string>("1");
  const [newSubjectName, setNewSubjectName] = useState("");
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
      console.log('Teacher data:', teacherData);
      console.log('Course subjects:', csData);
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
    let courseId: number;
    let subjectId: number;

    // Si se seleccionó "Nuevo" para curso, crearlo primero
    if (selectedCourseId === NEW_OPTION_VALUE) {
      if (!newCourseName.trim()) {
        setError("El nombre del curso es requerido");
        return;
      }
      try {
        const response = await fetch(`${API_URL}/courses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            name: newCourseName.trim(), 
            year: newCourseYear
          }),
          credentials: 'include',
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message);
        }
        const newCourse: Course = await response.json();
        courseId = newCourse.id;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al crear curso");
        return;
      }
    } else {
      courseId = parseInt(selectedCourseId);
    }

    // Si se seleccionó "Nuevo" para materia, crearla primero
    if (selectedSubjectId === NEW_OPTION_VALUE) {
      if (!newSubjectName.trim()) {
        setError("El nombre de la materia es requerido");
        return;
      }
      try {
        const response = await fetch(`${API_URL}/subjects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newSubjectName.trim() }),
          credentials: 'include',
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message);
        }
        const newSubject: Subject = await response.json();
        subjectId = newSubject.id;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al crear materia");
        return;
      }
    } else {
      subjectId = parseInt(selectedSubjectId);
    }

    // Crear el Course-Subject
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const newCs = await createCourseSubject(courseId, subjectId);
      
      // Recargar course-subjects para actualizar el select
      const csData = await getCourseSubjects();
      setCourseSubjects(csData);
      
      // Seleccionar el nuevo course-subject
      const newCsId = newCs.id.toString();
      setSelectedExistingCs(newCsId);
      
      // Asignar automáticamente al profesor
      await assignTeacherToCourse(teacher!.id, newCs.id);
      
      setSuccess("Curso/Materia creado y asignado correctamente");
      setSelectedCourseId("");
      setSelectedSubjectId("");
      setNewCourseName("");
      setNewSubjectName("");
      setShowCreateNew(false);
      
      // Recargar datos del profesor
      const updatedTeacher = await getTeacherWithAssignments(teacher!.id);
      setTeacher(updatedTeacher);
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
    setNewCourseName("");
    setNewCourseYear("1");
    setNewSubjectName("");
    setError(null);
    setSuccess(null);
    setShowCreateNew(false);
    onClose();
  };

  // Generar opciones para los selects
  const courseOptions: SelectOption[] = [
    ...courses.map((course) => ({
      value: course.id,
      label: `${course.name} (${course.year}°)`,
    })),
    { value: NEW_OPTION_VALUE, label: "[Nuevo] Curso..." },
  ];

  const subjectOptions: SelectOption[] = [
    ...subjects.map((subject) => ({
      value: subject.id,
      label: subject.name,
    })),
    { value: NEW_OPTION_VALUE, label: "[Nuevo] Materia..." },
  ];

  // Generar opciones para el select de course-subjects existentes
  const csOptions: SelectOption[] = courseSubjects.map((cs) => ({
    value: cs.id,
    label: `${cs.course?.year || ''}° ${cs.course?.name || 'Curso'} - ${cs.subject?.name || 'Materia'}`,
  }));

  // Acceder a las asignaciones del profesor (puede venir como teacher_courses o Tcs)
  const currentAssignments = teacher?.teacher_courses || (teacher as any)?.Tcs || [];

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
                Seleccioná un curso y una materia para crear una nueva combinación:
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
                  {selectedCourseId === NEW_OPTION_VALUE && (
                    <>
                      <input
                        type="text"
                        className="edit-modal__input"
                        placeholder="Nombre del nuevo curso (ej: A, B, C)"
                        value={newCourseName}
                        onChange={(e) => setNewCourseName(e.target.value)}
                        disabled={loading}
                      />
                      <div className="edit-modal__select-year-wrapper">
                        <select
                          className="edit-modal__select-year"
                          value={newCourseYear}
                          onChange={(e) => setNewCourseYear(e.target.value)}
                          disabled={loading}
                        >
                          <option value="1">1° Grado</option>
                          <option value="2">2° Grado</option>
                          <option value="3">3° Grado</option>
                          <option value="4">4° Grado</option>
                          <option value="5">5° Grado</option>
                          <option value="6">6° Grado</option>
                        </select>
                      </div>
                    </>
                  )}
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
                  {selectedSubjectId === NEW_OPTION_VALUE && (
                    <input
                      type="text"
                      className="edit-modal__input"
                      placeholder="Nombre de la nueva materia"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      disabled={loading}
                    />
                  )}
                </div>
              </div>
              <button
                className="edit-modal-btn edit-modal-btn--create"
                onClick={handleCreateCourseSubject}
                disabled={(!selectedCourseId || !selectedSubjectId) || loading}
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
              {currentAssignments.map((assignment: any) => {
                // Acceder a los datos del curso y materia (puede venir como cs, Cs, o course/subject directamente)
                const csData = assignment.cs || assignment.Cs || {};
                const courseData = csData.course || csData.Course || {};
                const subjectData = csData.subject || csData.Subject || {};
                const courseYear = courseData.year || '';
                const courseName = courseData.name || 'Curso';
                const subjectName = subjectData.name || 'Materia';

                return (
                  <li key={assignment.id} className="edit-modal__assignment-item">
                    <div className="edit-modal__assignment-info">
                      <span className="edit-modal__assignment-course">
                        {courseYear}° {courseName} - {subjectName}
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
                );
              })}
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
