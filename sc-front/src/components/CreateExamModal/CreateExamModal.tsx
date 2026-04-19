import { useState, type ReactElement } from "react";
import Modal from "../Modal/Modal";
import { createExam, type CreateExamData } from "../../services/exam.service";
import "./CreateExamModal.css";

export interface CreateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  csId: number;
  teacherId: number;
  onSuccess?: () => void;
}

const EXAM_TYPES = [
  { value: "EXAMEN", label: "Examen" },
  { value: "TP", label: "Trabajo Práctico" },
  { value: "RECUPERATORIO", label: "Recuperatorio" },
] as const;

export default function CreateExamModal({
  isOpen,
  onClose,
  csId,
  teacherId,
  onSuccess,
}: CreateExamModalProps): ReactElement | null {
  const [title, setTitle] = useState("");
  const [examNumber, setExamNumber] = useState("1");
  const [type, setType] = useState<"EXAMEN" | "TP" | "RECUPERATORIO">("EXAMEN");
  const [examDate, setExamDate] = useState("");
  const [examTime, setExamTime] = useState("08:00");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (!examDate) return;

    setLoading(true);
    setError(null);

    try {
      const data: CreateExamData = {
        cs_id: csId,
        teacher_id: teacherId,
        title: title.trim(),
        type,
        exam_number: examNumber,
        exam_date: new Date(`${examDate}T${examTime}`).toISOString(),
      };

      await createExam(data);
      resetForm();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al crear la evaluación");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setExamNumber("1");
    setType("EXAMEN");
    setExamDate("");
    setExamTime("08:00");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nueva Evaluación">
      <form className="create-exam-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="exam-title" className="form-label">
            Título
          </label>
          <input
            id="exam-title"
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
            <label htmlFor="exam-number" className="form-label">
              N° Evaluación
            </label>
            <input
              id="exam-number"
              type="number"
              className="form-input"
              min="1"
              value={examNumber}
              onChange={(e) => setExamNumber(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="exam-type" className="form-label">
              Tipo
            </label>
            <select
              id="exam-type"
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
            <label htmlFor="exam-date" className="form-label">
              Fecha
            </label>
            <input
              id="exam-date"
              type="date"
              className="form-input"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="exam-time" className="form-label">
              Hora
            </label>
            <input
              id="exam-time"
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
          <button type="button" className="btn-cancel" onClick={handleClose}>
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={loading || !title.trim() || !examDate}
          >
            {loading ? "Creando..." : "Crear Evaluación"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
