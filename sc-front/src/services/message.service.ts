const API_URL = '/api';

export interface TeacherContact {
  id: number;
  name: string;
  lastname: string;
  email: string;
  students: {
    id: number;
    name: string;
    lastname: string;
  }[];
}

export interface Message {
  id: number;
  sender: number;
  receiver: number;
  content: string;
  created_at: string;
  is_read: boolean;
  Sender?: {
    name: string;
    lastname: string;
  };
  Receiver?: {
    name: string;
    lastname: string;
  };
}

export async function getTeacherContacts(teacherId: number): Promise<TeacherContact[]> {
  const response = await fetch(`${API_URL}/message/teacher/${teacherId}/contacts`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch teacher contacts');
  }

  return await response.json();
}

export async function getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
  const response = await fetch(`${API_URL}/message/conversation/${user1Id}/${user2Id}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch conversation');
  }

  return await response.json();
}

export async function sendMessage(sender: number, receiver: number, content: string): Promise<Message> {
  const response = await fetch(`${API_URL}/message/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sender, receiver, content }),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send message');
  }

  return await response.json();
}

export async function markAsRead(messageId: number, userId: number): Promise<Message> {
  const response = await fetch(`${API_URL}/message/read/${messageId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: userId }),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to mark message as read');
  }

  return await response.json();
}

export async function getUnreadMessages(userId: number): Promise<Message[]> {
  const response = await fetch(`${API_URL}/message/unread/${userId}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch unread messages');
  }

  return await response.json();
}

export interface ParentContact {
  id: number;
  name: string;
  lastname: string;
  email: string;
  subjects: string[];
}

export async function getParentContacts(parentId: number): Promise<ParentContact[]> {
  const response = await fetch(`${API_URL}/message/parent/${parentId}/contacts`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch parent contacts');
  }

  return await response.json();
}
