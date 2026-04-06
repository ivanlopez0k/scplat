import { io, type Socket } from 'socket.io-client';

export type { Socket };

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Notification {
  id: number;
  message: string;
  type: 'grade_update';
  subject_name: string | null;
  course_name: string | null;
  is_read: boolean;
  created_at: string;
}

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket && socket.connected) return socket;

  // Connect to the backend server - cookies (httpOnly) will be sent automatically
  // Socket.IO will use the /socket.io path which is proxied by Vite
  socket = io(API_URL, {
    withCredentials: true,
    transports: ['polling', 'websocket'],
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export async function getNotifications(): Promise<Notification[]> {
  const response = await fetch(`${API_URL}/notification`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Error al obtener notificaciones');
  return response.json();
}

export async function getUnreadCount(): Promise<number> {
  const response = await fetch(`${API_URL}/notification/unread-count`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Error al obtener contador');
  const data = await response.json();
  return data.unread_count;
}

export async function markAsRead(id: number): Promise<Notification> {
  const response = await fetch(`${API_URL}/notification/${id}/read`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Error al marcar como leída');
  return response.json();
}

export async function markAllAsRead(): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/notification/read-all`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Error al marcar todas como leídas');
  return response.json();
}
