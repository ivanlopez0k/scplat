import { useState, useRef, useEffect, type ReactElement } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import './NotificationBell.css';

export default function NotificationBell(): ReactElement {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [wasOpen, setWasOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click (only if open)
  useEffect(() => {
    if (!isOpen) return;
    
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        handleClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 200);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen) {
      handleClose();
    } else {
      setIsOpen(true);
      setIsClosing(false);
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  };

  const handleNotificationClick = async (id: number) => {
    const notif = notifications.find(n => n.id === id);
    if (notif && !notif.is_read) {
      await markAsRead(id);
    }
  };

  return (
    <div className={`notification-bell ${unreadCount > 0 ? 'notification-bell--has-unread' : ''}`} ref={ref}>
      <button
        className="notification-bell__btn"
        aria-label="Notificaciones"
        onClick={handleToggle}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="notification-bell__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {(isOpen || isClosing) && (
        <div className={`notification-bell__dropdown ${isClosing ? 'notification-bell__dropdown--closing' : ''}`}>
          <div className="notification-bell__header">
            <h3>Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                className="notification-bell__mark-all"
                onClick={() => {
                  markAllAsRead();
                  handleClose();
                }}
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="notification-bell__list">
            {notifications.length === 0 ? (
              <p className="notification-bell__empty">No hay notificaciones</p>
            ) : (
              notifications.slice(0, 20).map((notif) => (
                <button
                  key={notif.id}
                  className={`notification-bell__item ${!notif.is_read ? 'notification-bell__item--unread' : ''}`}
                  onClick={() => {
                    handleNotificationClick(notif.id);
                    handleClose();
                  }}
                >
                  <div className="notification-bell__item-icon">
                    {notif.type === 'grade_update' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div className="notification-bell__item-content">
                    <p className="notification-bell__item-message">{notif.message}</p>
                    {notif.course_name && (
                      <span className="notification-bell__item-course">{notif.course_name}</span>
                    )}
                  </div>
                  <span className="notification-bell__item-time">
                    {formatDate(notif.created_at)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
