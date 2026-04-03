export interface Course {
  id: number;
  name: string;
  year: number;
}

const API_URL = '/api';

export async function getCourses(): Promise<Course[]> {
  const response = await fetch(`${API_URL}/courses/public`);

  if (!response.ok) {
    throw new Error('Failed to fetch courses');
  }

  return await response.json();
}
