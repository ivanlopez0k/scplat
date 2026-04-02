export interface Course {
  id: number;
  name: string;
  year: string;
}

export interface Subject {
  id: number;
  name: string;
}

export interface CourseSubject {
  id: number;
  course_id: number;
  subject_id: number;
  course?: Course;
  subject?: Subject;
}

export interface TeacherAssignment {
  id: number;
  teacher_id: number;
  cs_id: number;
  cs?: CourseSubject;
}

export interface Teacher {
  id: number;
  name: string;
  lastname: string;
  dni: string;
  email: string;
  role: 'teacher';
  teacher_courses?: TeacherAssignment[];
}

const API_URL = '/api';

export async function getCourses(): Promise<Course[]> {
  const response = await fetch(`${API_URL}/courses`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch courses');
  }

  const courses: Course[] = await response.json();
  return courses;
}

export async function getSubjects(): Promise<Subject[]> {
  const response = await fetch(`${API_URL}/subjects`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch subjects');
  }

  const subjects: Subject[] = await response.json();
  return subjects;
}

export async function getCourseSubjects(): Promise<CourseSubject[]> {
  const response = await fetch(`${API_URL}/cs`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch course-subjects');
  }

  const courseSubjects: CourseSubject[] = await response.json();
  return courseSubjects;
}

export async function createCourseSubject(course_id: number, subject_id: number): Promise<CourseSubject> {
  const response = await fetch(`${API_URL}/cs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ course_id, subject_id }),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create course-subject');
  }

  const courseSubject: CourseSubject = await response.json();
  return courseSubject;
}

export async function getTeacherWithAssignments(teacherId: number): Promise<Teacher> {
  const response = await fetch(`${API_URL}/user/teacher/${teacherId}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch teacher');
  }

  const teacher: Teacher = await response.json();
  return teacher;
}

export async function assignTeacherToCourse(teacher_id: number, cs_id: number): Promise<TeacherAssignment> {
  const response = await fetch(`${API_URL}/user/assign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ teacher_id, cs_id }),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to assign teacher');
  }

  const assignment: TeacherAssignment = await response.json();
  return assignment;
}

export async function removeTeacherFromCourse(tcId: number): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/user/assign/${tcId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to remove assignment');
  }

  const result: { message: string } = await response.json();
  return result;
}
