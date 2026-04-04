import type { ReactElement } from "react";
import "./SubjectCard.css";

export interface SubjectCardProps {
  name: string;
  grade?: number;
  noGrade?: boolean;
}

function getLevel(grade: number): "green" | "yellow" | "red" {
  if (grade >= 7) return "green";
  if (grade >= 5) return "yellow";
  return "red";
}

function getLabel(level: "green" | "yellow" | "red"): string {
  if (level === "green") return "Vas muy bien";
  if (level === "yellow") return "Repasar";
  return "Atención";
}

export default function SubjectCard({ name, grade, noGrade }: SubjectCardProps): ReactElement {
  if (noGrade) {
    return (
      <div className="subject-card subject-card--no-grade">
        <span className="subject-card__name">{name}</span>
        <span className="subject-card__no-grade">Sin notas</span>
      </div>
    );
  }

  const level = getLevel(grade ?? 0);
  const label = getLabel(level);
  const pct = Math.min(((grade ?? 0) / 10) * 100, 100);

  return (
    <div className="subject-card">
      <span className="subject-card__name">{name}</span>
      <span className={`subject-card__grade subject-card__grade--${level}`}>
        {(grade ?? 0).toFixed(1)}
      </span>

      <div className="subject-card__bar">
        <div
          className={`subject-card__bar-fill subject-card__bar-fill--${level}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className={`subject-card__status subject-card__status--${level}`}>
        <span className={`subject-card__dot subject-card__dot--${level}`} />
        <span className="subject-card__status-text">{label}</span>
      </div>
    </div>
  );
}
