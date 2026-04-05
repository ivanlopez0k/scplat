const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');
const { create, getByCourse, getForStudent, getForParent, getByTeacher, remove } = require('../controllers/announcement.controller');

// Teacher creates announcement
router.post('/', authMiddleware, checkRole('teacher'), create);

// Get announcements by course
router.get('/course/:course_id', authMiddleware, getByCourse);

// Get announcements for a student (based on enrolled courses)
router.get('/student/:student_id', authMiddleware, checkRole('student', 'admin'), getForStudent);

// Get announcements for a parent (based on children's courses)
router.get('/parent/:parent_id', authMiddleware, checkRole('parent', 'admin'), getForParent);

// Get announcements by teacher
router.get('/teacher/:teacher_id', authMiddleware, checkRole('teacher', 'admin'), getByTeacher);

// Teacher deletes their announcement
router.delete('/:id', authMiddleware, remove);

module.exports = router;
