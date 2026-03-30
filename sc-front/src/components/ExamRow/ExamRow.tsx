import type { ReactElement } from "react";
import "./ExamRow.css";

export interface ExamRowProps {
  subject: string;
  detail: string;
  dateLabel: string;
}

export default function ExamRow({ subject, detail, dateLabel }: ExamRowProps): ReactElement {
  return (
    <div className="exam-row">
      <div className="exam-row__info">
        <span className="exam-row__title">{subject}</span>
        <span className="exam-row__detail">{detail}</span>
      </div>
      <span className="exam-row__date">{dateLabel}</span>
    </div>
  );
}
