import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  getSocket,
  getNotifications,
  getUnreadCount,
  markAsRead as markAsReadApi,
  markAllAsRead as markAllAsReadApi,
  type Notification,
  type Socket,
} from '../services/notification.service';
import { checkAuth } from '../services/auth.service';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);

  const refreshNotifications = useCallback(async () => {
    try {
      const [notifs, count] = await Promise.all([
        getNotifications(),
        getUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
    let mounted = true;

    const initSocket = async () => {
      try {
        const auth = await checkAuth();
        if (!auth.authenticated || !auth.user) return;

        // Only connect for students
        if (auth.user.role !== 'student') return;

        // Get token from cookie
        const match = document.cookie.match(/token=([^;]+)/);
        const token = match ? match[1] : '';
        if (!token) return;

        const newSocket = getSocket(token);
        if (mounted) {
          setSocket(newSocket);

          // Load existing notifications
          await refreshNotifications();

          // Listen for new notifications
          newSocket.on('notification:new', (notification: Notification) => {
            setNotifications((prev) => [notification, ...prev]);
            setUnreadCount((prev) => prev + 1);

            // Show browser notification if supported
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('EducAR', {
                body: notification.message,
                icon: '/favicon.svg',
              });
            }
          });
        }
      } catch (err) {
        console.error('Error initializing notification socket:', err);
      }
    };

    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    initSocket();

    return () => {
      mounted = false;
      if (socket) {
        socket.off('notification:new');
      }
    };
  }, [refreshNotifications]);

  const markAsRead = async (id: number) => {
    try {
      await markAsReadApi(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllAsReadApi();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
