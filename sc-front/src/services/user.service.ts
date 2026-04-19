export interface User {
  id: number;
  name: string;
  lastname: string;
  dni: string;
  email: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
}

const API_URL = '/api';

export async function getUsersByRole(role: string): Promise<User[]> {
  const response = await fetch(`${API_URL}/user/by-role/${role}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  const users: User[] = await response.json();
  return users;
}
