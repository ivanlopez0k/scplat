const API_URL = '/api';

export interface Exam {
  id: number;
  cs_id: number;
  teacher_id: number;
  title: string;
  exam_number: string;
  type: 'EXAMEN' | 'TP' | 'RECUPERATORIO';
  exam_date: string;
  User?: {
    name: string;
    lastname: string;
  };
  Cs?: {
    id: number;
    course?: {
      name: string;
      year: number;
    };
    subject?: {
      name: string;
    };
  };
}

export interface CreateExamData {
  cs_id: number;
  teacher_id: number;
  title: string;
  type: 'EXAMEN' | 'TP' | 'RECUPERATORIO';
  exam_number: string;
  exam_date: string;
}

export async function getExamsForStudent(studentId: number): Promise<Exam[]> {
  const response = await fetch(`${API_URL}/exam/student/${studentId}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch exams for student');
  }

  return await response.json();
}

export async function createExam(data: CreateExamData): Promise<Exam> {
  const response = await fetch(`${API_URL}/exam/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create exam');
  }

  return await response.json();
}

export async function getAllExams(): Promise<Exam[]> {
  const response = await fetch(`${API_URL}/exam/`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch exams');
  }

  return await response.json();
}

export async function getExamsByCsId(csId: number): Promise<Exam[]> {
  const response = await fetch(`${API_URL}/exam/cs/${csId}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch exams for course-subject');
  }

  return await response.json();
}

export async function updateExam(id: number, data: Partial<CreateExamData>): Promise<Exam> {
  const response = await fetch(`${API_URL}/exam/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update exam');
  }

  return await response.json();
}

export async function deleteExam(id: number): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/exam/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete exam');
  }

  return await response.json();
}
