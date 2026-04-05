export interface Announcement {
  id: number;
  title: string;
  description: string;
  course_id: number;
  teacher_id: number;
  created_at: string;
  updated_at: string;
  course?: {
    id: number;
    name: string;
    year: string;
  };
  subject?: {
    id: number;
    name: string;
  };
}

export interface CreateAnnouncementData {
  title: string;
  description: string;
  course_id: number;
  teacher_id: number;
}

const API_URL = '/api';

export async function createAnnouncement(data: CreateAnnouncementData): Promise<Announcement> {
  const response = await fetch(`${API_URL}/announcement`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create announcement');
  }

  const announcement: Announcement = await response.json();
  return announcement;
}

export async function getTeacherAnnouncements(teacherId: number): Promise<Announcement[]> {
  const response = await fetch(`${API_URL}/announcement/teacher/${teacherId}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch teacher announcements');
  }

  const announcements: Announcement[] = await response.json();
  return announcements;
}

export async function deleteAnnouncement(id: number): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/announcement/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete announcement');
  }

  const result: { message: string } = await response.json();
  return result;
}

export async function getStudentAnnouncements(studentId: number): Promise<Announcement[]> {
  const response = await fetch(`${API_URL}/announcement/student/${studentId}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch student announcements');
  }

  const announcements: Announcement[] = await response.json();
  return announcements;
}

export async function getParentAnnouncements(parentId: number): Promise<Announcement[]> {
  const response = await fetch(`${API_URL}/announcement/parent/${parentId}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch parent announcements');
  }

  const announcements: Announcement[] = await response.json();
  return announcements;
}
