const API_URL = '/api';

export interface ExamStudent {
  student_id: number;
  name: string;
  lastname: string;
  dni: string;
  grade: {
    gradeId: number;
    note: number;
  } | null;
}

export interface GradeEntry {
  student_id: number;
  note: number;
}

export async function getStudentsForExam(examId: number): Promise<ExamStudent[]> {
  const response = await fetch(`${API_URL}/grade/exam/${examId}/students`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch students for exam');
  }

  return await response.json();
}

export async function bulkSaveGrades(examId: number, grades: GradeEntry[]): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/grade/exam/${examId}/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ grades }),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to save grades');
  }

  return await response.json();
}
