import { useState, useEffect, type ReactElement } from "react";
import Modal from "../Modal/Modal";
import { updateExam, type Exam } from "../../services/exam.service";
import "./EditExamModal.css";

export interface EditExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam;
  onSuccess?: () => void;
}

const EXAM_TYPES = [
  { value: "EXAMEN", label: "Examen" },
  { value: "TP", label: "Trabajo Práctico" },
  { value: "RECUPERATORIO", label: "Recuperatorio" },
] as const;

export default function EditExamModal({
  isOpen,
  onClose,
  exam,
  onSuccess,
}: EditExamModalProps): ReactElement | null {
  const [title, setTitle] = useState(exam.title);
  const [examNumber, setExamNumber] = useState(exam.exam_number);
  const [type, setType] = useState<"EXAMEN" | "TP" | "RECUPERATORIO">(exam.type);
  const [examDate, setExamDate] = useState("");
  const [examTime, setExamTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form values when exam changes
  useEffect(() => {
    setTitle(exam.title);
    setExamNumber(exam.exam_number);
    setType(exam.type);
    const d = new Date(exam.exam_date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    setExamDate(`${year}-${month}-${day}`);
    setExamTime(`${hours}:${minutes}`);
  }, [exam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (!examDate) return;

    setLoading(true);
    setError(null);

    try {
      await updateExam(exam.id, {
        title: title.trim(),
        exam_number: examNumber,
        type,
        exam_date: new Date(`${examDate}T${examTime}`).toISOString(),
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al actualizar la evaluación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Evaluación">
      <form className="edit-exam-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="edit-exam-title" className="form-label">
            Título
          </label>
          <input
            id="edit-exam-title"
            type="text"
            className="form-input"
            placeholder="Ej: Parcial Unidad 3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="edit-exam-number" className="form-label">
              N° Evaluación
            </label>
            <input
              id="edit-exam-number"
              type="text"
              className="form-input"
              value={examNumber}
              onChange={(e) => setExamNumber(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-exam-type" className="form-label">
              Tipo
            </label>
            <select
              id="edit-exam-type"
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
            >
              {EXAM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="edit-exam-date" className="form-label">
              Fecha
            </label>
            <input
              id="edit-exam-date"
              type="date"
              className="form-input"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-exam-time" className="form-label">
              Hora
            </label>
            <input
              id="edit-exam-time"
              type="time"
              className="form-input"
              value={examTime}
              onChange={(e) => setExamTime(e.target.value)}
              required
            />
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={loading || !title.trim() || !examDate}
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
