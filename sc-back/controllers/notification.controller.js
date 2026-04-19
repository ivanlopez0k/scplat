const { getNotificationsByStudent, getUnreadCount, markAsRead, markAllAsRead } = require('../services/notification.service');

async function getAll(req, res) {
  try {
    const studentId = req.user.id;
    const notifications = await getNotificationsByStudent(studentId);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getUnread(req, res) {
  try {
    const studentId = req.user.id;
    const count = await getUnreadCount(studentId);
    res.status(200).json({ unread_count: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function markRead(req, res) {
  try {
    const { id } = req.params;
    const studentId = req.user.id;
    const notification = await markAsRead(id, studentId);
    res.status(200).json(notification);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

async function markAllRead(req, res) {
  try {
    const studentId = req.user.id;
    const result = await markAllAsRead(studentId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { getAll, getUnread, markRead, markAllRead };
