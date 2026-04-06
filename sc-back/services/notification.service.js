const { Notification, Exam, Cs, Subject, Course } = require('../models');
const { getIo } = require('../socket');

async function createGradeUpdateNotification(studentId, examId) {
  try {
    // Get exam details with subject and course info
    const exam = await Exam.findByPk(examId, {
      include: [
        {
          model: Cs,
          as: 'Cs',
          include: [
            { model: Subject, as: 'subject', attributes: ['name'] },
            { model: Course, as: 'course', attributes: ['name', 'year'] }
          ]
        }
      ]
    });

    if (!exam) return;

    const subjectName = exam.Cs?.subject?.name ?? 'Materia';
    const courseName = exam.Cs?.course
      ? `${exam.Cs.course.year}° ${exam.Cs.course.name}`
      : '';

    // Create notification message
    const message = `Se ha actualizado la nota de ${subjectName}`;

    // Save to database
    const notification = await Notification.create({
      student_id: studentId,
      exam_id: examId,
      message,
      type: 'grade_update',
      subject_name: subjectName,
      course_name: courseName,
    });

    // Emit real-time notification via Socket.IO
    const io = getIo();
    io.to(`user-${studentId}`).emit('notification:new', {
      id: notification.id,
      message,
      type: 'grade_update',
      subject_name: subjectName,
      course_name: courseName,
      is_read: false,
      created_at: notification.created_at,
    });
  } catch (error) {
    console.error('Error creating notification:', error.message);
  }
}

async function getNotificationsByStudent(studentId, limit = 50) {
  const notifications = await Notification.findAll({
    where: { student_id: studentId },
    order: [['created_at', 'DESC']],
    limit,
  });
  return notifications;
}

async function getUnreadCount(studentId) {
  const count = await Notification.count({
    where: { student_id: studentId, is_read: false }
  });
  return count;
}

async function markAsRead(notificationId, studentId) {
  const notification = await Notification.findOne({
    where: { id: notificationId, student_id: studentId }
  });
  if (!notification) throw new Error('Notificación no encontrada');
  await notification.update({ is_read: true });
  return notification;
}

async function markAllAsRead(studentId) {
  await Notification.update(
    { is_read: true },
    { where: { student_id: studentId, is_read: false } }
  );
  return { message: 'Todas las notificaciones marcadas como leídas' };
}

module.exports = {
  createGradeUpdateNotification,
  getNotificationsByStudent,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
