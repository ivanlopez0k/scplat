import type { ReactElement } from "react";
import type { LeaderboardStudent } from "../../services/student.service";
import "./Leaderboard.css";

export interface LeaderboardProps {
  students: LeaderboardStudent[];
  courseName?: string;
  loading?: boolean;
  error?: string | null;
}

const CrownIcon = (): ReactElement => (
  <svg className="leaderboard-crown" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 2h14v2H5v-2z" />
  </svg>
);

const RankBadge = ({ rank }: { rank: number }): ReactElement => {
  const colors = {
    1: "leaderboard-rank--gold",
    2: "leaderboard-rank--silver",
    3: "leaderboard-rank--bronze",
  };

  return (
    <span className={`leaderboard-rank ${colors[rank as keyof typeof colors] || ""}`}>
      {rank}
    </span>
  );
};

export default function Leaderboard({
  students,
  courseName,
  loading = false,
  error = null,
}: LeaderboardProps): ReactElement | null {
  if (loading) {
    return (
      <div className="leaderboard">
        <h3 className="leaderboard-title">🏆 Top del Curso</h3>
        <p className="leaderboard-loading">Cargando leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard">
        <h3 className="leaderboard-title">🏆 Top del Curso</h3>
        <p className="leaderboard-error">Error: {error}</p>
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="leaderboard">
        <h3 className="leaderboard-title">🏆 Top del Curso</h3>
        <p className="leaderboard-empty">
          {courseName ? `No hay datos de rendimiento en ${courseName}` : "No hay datos de rendimiento"}
        </p>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <h3 className="leaderboard-title">
        🏆 Top del Curso
        {courseName && <span className="leaderboard-course">{courseName}</span>}
      </h3>
      <div className="leaderboard-list">
        {students.map((student, index) => {
          const rank = index + 1;
          const isFirst = rank === 1;
          const avg = student.average ? student.average.toFixed(1) : 'N/A';

          return (
            <div
              key={student.student_id}
              className={`leaderboard-item ${isFirst ? "leaderboard-item--first" : ""}`}
            >
              <div className="leaderboard-item__left">
                <RankBadge rank={rank} />
                {isFirst && <CrownIcon />}
                <span className="leaderboard-item__name">
                  {student.lastname}, {student.name}
                </span>
              </div>
              <span className="leaderboard-item__average">
                {avg}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
