import type { ReactElement } from "react";
import "./TeacherCourseCard.css";

export interface TeacherCourseCardProps {
  subjectName: string;
  courseName: string;
  onClick: () => void;
}

export default function TeacherCourseCard({
  subjectName,
  courseName,
  onClick,
}: TeacherCourseCardProps): ReactElement {
  return (
    <div className="teacher-course-card" onClick={onClick}>
      <div className="teacher-course-card__content">
        <span className="teacher-course-card__subject">{subjectName}</span>
        <span className="teacher-course-card__course">{courseName}</span>
      </div>
      <span className="teacher-course-card__arrow">›</span>
    </div>
  );
}
