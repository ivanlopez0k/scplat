import type { ReactElement } from "react";
import ExamRow from "../ExamRow/ExamRow";
import type { Exam } from "../../services/exam.service";
import "./ExamListCard.css";

export interface ExamListCardProps {
  exams: Exam[];
  loading: boolean;
  title?: string;
  emptyMessage?: string;
  onEdit?: (exam: Exam) => void;
  onDelete?: (exam: Exam) => void;
  onSelectExam?: (exam: Exam) => void;
}

const MONTH_NAMES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()];
  return `${day} ${month}`;
}

function formatExamDetail(exam: Exam): string {
  const parts: string[] = [];
  if (exam.Cs?.subject?.name) {
    parts.push(exam.Cs.subject.name);
  }
  if (exam.exam_number) {
    parts.push(`N° ${exam.exam_number}`);
  }
  if (exam.type) {
    const typeLabels: Record<string, string> = {
      EXAMEN: "Examen",
      TP: "TP",
      RECUPERATORIO: "Recuperatorio",
    };
    parts.push(typeLabels[exam.type] || exam.type);
  }
  return parts.join(" — ");
}

export default function ExamListCard({
  exams,
  loading,
  title = "Próximas evaluaciones",
  emptyMessage = "No hay evaluaciones próximas",
  onEdit,
  onDelete,
  onSelectExam,
}: ExamListCardProps): ReactElement {
  // Sort by date ascending (closest first)
  const sortedExams = [...exams].sort(
    (a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime()
  );

  return (
    <div className="exam-list-card">
      <h2 className="dash-section-title">{title}</h2>

      {loading ? (
        <div className="exam-list-card__loading">
          <div className="exam-list-card__skeleton" />
          <div className="exam-list-card__skeleton" />
          <div className="exam-list-card__skeleton" />
        </div>
      ) : sortedExams.length === 0 ? (
        <p className="exam-list-card__empty">{emptyMessage}</p>
      ) : (
        <div className="exam-list-card__list">
          {sortedExams.map((exam) => (
            <div
              className={`exam-list-card__row ${onSelectExam ? "exam-list-card__row--clickable" : ""}`}
              key={exam.id}
              onClick={() => onSelectExam?.(exam)}
            >
              <ExamRow
                subject={exam.title}
                detail={formatExamDetail(exam)}
                dateLabel={formatDateLabel(exam.exam_date)}
              />
              {(onEdit || onDelete) && (
                <div className="exam-list-card__actions" onClick={(e) => e.stopPropagation()}>
                  {onEdit && (
                    <button
                      className="exam-list-card__action exam-list-card__action--edit"
                      onClick={(e) => { e.stopPropagation(); onEdit(exam); }}
                      aria-label="Editar evaluación"
                      title="Editar"
                    >
                      ✎
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="exam-list-card__action exam-list-card__action--delete"
                      onClick={(e) => { e.stopPropagation(); onDelete(exam); }}
                      aria-label="Eliminar evaluación"
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
