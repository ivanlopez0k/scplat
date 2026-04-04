import { useState, useEffect, type ReactElement } from "react";
import Modal from "../Modal/Modal";
import {
  getStudentsForExam,
  bulkSaveGrades,
  type ExamStudent,
  type GradeEntry,
} from "../../services/exam-grade.service";
import "./ExamStudentList.css";

export interface ExamStudentListProps {
  isOpen: boolean;
  onClose: () => void;
  examId: number;
  examTitle: string;
  onSuccess?: () => void;
}

export default function ExamStudentList({
  isOpen,
  onClose,
  examId,
  examTitle,
  onSuccess,
}: ExamStudentListProps): ReactElement | null {
  const [students, setStudents] = useState<ExamStudent[]>([]);
  const [grades, setGrades] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    setSaved(false);
    setGrades({});

    getStudentsForExam(examId)
      .then((data) => {
        setStudents(data);
        const initialGrades: Record<number, string> = {};
        data.forEach((s) => {
          initialGrades[s.student_id] = s.grade ? String(s.grade.note) : "";
        });
        setGrades(initialGrades);
      })
      .catch((err) => {
        setError(err.message || "Error al cargar alumnos");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, examId]);

  const handleGradeChange = (studentId: number, value: string) => {
    // Allow only numbers and empty string
    if (value !== "" && !/^\d+$/.test(value)) return;
    // Cap at 100
    if (value !== "" && parseInt(value) > 100) return;
    setGrades((prev) => ({ ...prev, [studentId]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const gradesToSave: GradeEntry[] = students
        .map((s) => ({
          student_id: s.student_id,
          note: grades[s.student_id] === "" ? 0 : parseInt(grades[s.student_id]),
        }))
        .filter((g) => g.note >= 0 && g.note <= 100);

      await bulkSaveGrades(examId, gradesToSave);
      setSaved(true);
      onSuccess?.();

      // Close after short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Error al guardar notas");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Calificar: ${examTitle}`}
    >
      <div className="exam-student-list">
        {loading ? (
          <div className="exam-student-list__loading">
            <div className="exam-student-list__skeleton" />
            <div className="exam-student-list__skeleton" />
            <div className="exam-student-list__skeleton" />
            <div className="exam-student-list__skeleton" />
          </div>
        ) : error ? (
          <p className="exam-student-list__error">{error}</p>
        ) : students.length === 0 ? (
          <p className="exam-student-list__empty">
            No hay alumnos inscriptos en este curso.
          </p>
        ) : (
          <>
            <div className="exam-student-list__header">
              <span className="exam-student-list__col exam-student-list__col--name">
                Alumno
              </span>
              <span className="exam-student-list__col exam-student-list__col--dni">
                DNI
              </span>
              <span className="exam-student-list__col exam-student-list__col--grade">
                Nota
              </span>
            </div>

            <div className="exam-student-list__body">
              {students.map((student) => (
                <div key={student.student_id} className="exam-student-list__row">
                  <span className="exam-student-list__col exam-student-list__col--name">
                    {student.lastname}, {student.name}
                  </span>
                  <span className="exam-student-list__col exam-student-list__col--dni">
                    {student.dni}
                  </span>
                  <span className="exam-student-list__col exam-student-list__col--grade">
                    <input
                      type="number"
                      className="exam-student-list__input"
                      min="0"
                      max="100"
                      placeholder="—"
                      value={grades[student.student_id] ?? ""}
                      onChange={(e) =>
                        handleGradeChange(student.student_id, e.target.value)
                      }
                    />
                  </span>
                </div>
              ))}
            </div>

            {saved && (
              <p className="exam-student-list__success">
                ✓ Notas guardadas correctamente
              </p>
            )}

            <div className="exam-student-list__footer">
              <button className="btn-cancel" onClick={onClose}>
                Cancelar
              </button>
              <button
                className="btn-save"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar Notas"}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
