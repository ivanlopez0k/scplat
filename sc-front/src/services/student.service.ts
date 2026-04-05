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

export interface StudentSubject {
  subject_id: number;
  subject_name: string;
  teachers: {
    id: number;
    name: string;
    lastname: string;
    email: string;
  }[];
}

export async function getStudentSubjects(studentId: number): Promise<StudentSubject[]> {
  const response = await fetch(`${API_URL}/enrollment/student/${studentId}/subjects`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch student subjects');
  }

  return await response.json();
}

export interface CourseSubjectStudent {
  student_id: number;
  name: string;
  lastname: string;
  dni: string;
  email: string;
  grades: {
    exam_id: number;
    exam_title: string;
    exam_type: string;
    exam_date: string | null;
    note: number;
  }[];
}

export interface CourseSubjectDetail {
  course: {
    id: number;
    name: string;
    year: number;
  };
  subject: {
    id: number;
    name: string;
  };
  students: CourseSubjectStudent[];
}

export interface LeaderboardStudent {
  student_id: number;
  name: string;
  lastname: string;
  dni: string;
  average: number;
}

export interface LeaderboardData {
  course: {
    id: number;
    name: string;
    year: number;
  } | null;
  topStudents: LeaderboardStudent[];
}

export async function getStudentsByCsId(csId: number): Promise<CourseSubjectDetail> {
  const response = await fetch(`${API_URL}/enrollment/cs/${csId}/students`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch students for course-subject');
  }

  return await response.json();
}

export async function getCourseLeaderboard(studentId: number): Promise<LeaderboardData> {
  const response = await fetch(`${API_URL}/grade/leaderboard/${studentId}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard');
  }

  return await response.json();
}
