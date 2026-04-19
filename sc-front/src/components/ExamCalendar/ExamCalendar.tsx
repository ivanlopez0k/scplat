import { useState, useMemo, type ReactElement } from "react";
import type { Exam } from "../../services/exam.service";
import "./ExamCalendar.css";

export interface ExamCalendarProps {
  exams: Exam[];
}

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DAY_NAMES = ["D", "L", "M", "M", "J", "V", "S"];

function buildCalendar(year: number, month: number, examDays: Set<number>) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells: { day: number; current: boolean; hasExam: boolean }[] = [];

  for (let i = startDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrev - i, current: false, hasExam: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true, hasExam: examDays.has(d) });
  }
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, current: false, hasExam: false });
    }
  }

  return cells;
}

export default function ExamCalendar({ exams }: ExamCalendarProps): ReactElement {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());

  // Build a set of days that have exams in the current month
  const examDays = useMemo(() => {
    const set = new Set<number>();
    exams.forEach((exam) => {
      const d = new Date(exam.exam_date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        set.add(d.getDate());
      }
    });
    return set;
  }, [exams, currentMonth, currentYear]);

  const cells = buildCalendar(currentYear, currentMonth, examDays);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const today = now.getDate();
  const isCurrentMonth = currentMonth === now.getMonth() && currentYear === now.getFullYear();

  return (
    <div className="exam-calendar">
      <div className="exam-calendar__header">
        <span className="exam-calendar__month">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </span>
        <div className="exam-calendar__nav">
          <button className="exam-calendar__nav-btn" onClick={handlePrevMonth} aria-label="Mes anterior">
            ‹
          </button>
          <button className="exam-calendar__nav-btn" onClick={handleNextMonth} aria-label="Mes siguiente">
            ›
          </button>
        </div>
      </div>
      <div className="exam-calendar__grid">
        {DAY_NAMES.map((d, i) => (
          <span className="exam-calendar__day-name" key={i}>{d}</span>
        ))}
        {cells.map((cell, i) => {
          const isToday = isCurrentMonth && cell.current && cell.day === today;
          return (
            <span
              key={i}
              className={`exam-calendar__day ${
                !cell.current ? "exam-calendar__day--other" : ""
              } ${isToday ? "exam-calendar__day--today" : ""} ${
                cell.hasExam ? "exam-calendar__day--exam" : ""
              }`}
            >
              {cell.day}
            </span>
          );
        })}
      </div>
    </div>
  );
}
