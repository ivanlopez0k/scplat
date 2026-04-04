const API_URL = '/api';

export interface Enrollment {
  id: number;
  student_id: number;
  course_id: number;
  school_year: number;
  course?: {
    id: number;
    name: string;
    year: number;
  };
}

export interface Subject {
  id: number;
  name: string;
}

export interface CourseSubject {
  id: number;
  course_id: number;
  subject_id: number;
  subject?: Subject;
}

export interface Grade {
  id: number;
  student_id: number;
  exam_id: number;
  note: number;
  Exam?: {
    id: number;
    title: string;
    type: string;
    exam_date: string;
    Cs?: {
      id: number;
      subject?: Subject;
    };
  };
}

export async function getStudentEnrollment(studentId: number): Promise<Enrollment[]> {
  const response = await fetch(`${API_URL}/enrollment/student/${studentId}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch enrollment');
  }

  return await response.json();
}

export async function getCourseSubjects(courseId: number): Promise<CourseSubject[]> {
  const response = await fetch(`${API_URL}/cs/course/${courseId}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch course subjects');
  }

  return await response.json();
}

export async function getStudentGrades(studentId: number): Promise<Grade[]> {
  const response = await fetch(`${API_URL}/grade/student/${studentId}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch grades');
  }

  return await response.json();
}
