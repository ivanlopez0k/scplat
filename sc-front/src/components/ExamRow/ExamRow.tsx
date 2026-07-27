import type { ReactElement } from "react";
import "./ExamRow.css";

export interface ExamRowProps {
  subject: string;
  detail: string;
  dateLabel: string;
  countdown?: string;
}

export default function ExamRow({ subject, detail, dateLabel, countdown }: ExamRowProps): ReactElement {
  return (
    <div className="exam-row">
      <div className="exam-row__info">
        <span className="exam-row__title">{subject}</span>
        <span className="exam-row__detail">{detail}</span>
      </div>
      <div className="exam-row__right">
        {countdown && (
          <span className={`exam-row__countdown ${getCountdownClass(countdown)}`}>
            {countdown}
          </span>
        )}
        <span className="exam-row__date">{dateLabel}</span>
      </div>
    </div>
  );
}

function getCountdownClass(countdown: string): string {
  const match = countdown.match(/(\d+)/);
  if (!match) return "";
  const days = parseInt(match[1], 10);
  if (days <= 2) return "exam-row__countdown--urgent";
  if (days <= 5) return "exam-row__countdown--soon";
  return "exam-row__countdown--normal";
}
