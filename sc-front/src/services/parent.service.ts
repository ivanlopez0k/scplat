const API_URL = '/api';

export interface ParentStudentLink {
  id: number;
  parent_id: number;
  student_id: number;
  student?: {
    name: string;
    lastname: string;
  };
}

export async function getStudentsByParent(parentId: number): Promise<ParentStudentLink[]> {
  const response = await fetch(`${API_URL}/ps/${parentId}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch parent-student links');
  }

  return await response.json();
}

export async function updateParentStudents(parentId: number, studentIds: number[]): Promise<ParentStudentLink[]> {
  const response = await fetch(`${API_URL}/ps/${parentId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ student_ids: studentIds }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update parent-student links');
  }

  return await response.json();
}

export async function deleteParentStudentLink(id: number): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/ps/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete parent-student link');
  }

  return await response.json();
}
