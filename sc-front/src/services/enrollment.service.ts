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

export async function createEnrollment(
  student_id: number,
  course_id: number,
  school_year: number
): Promise<Enrollment> {
  const response = await fetch(`${API_URL}/enrollment/`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ student_id, course_id, school_year }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create enrollment');
  }

  return await response.json();
}

export async function getStudentEnrollments(studentId: number): Promise<Enrollment[]> {
  const response = await fetch(`${API_URL}/enrollment/student/${studentId}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch enrollments');
  }

  return await response.json();
}

export async function deleteEnrollment(id: number): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/enrollment/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete enrollment');
  }

  return await response.json();
}
