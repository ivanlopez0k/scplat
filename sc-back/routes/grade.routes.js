const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');
const { create, getAll, getById, getByStudent, update, getStudentsForExam, bulkSave } = require('../controllers/grade.controller');

router.post('/', authMiddleware, checkRole('teacher'), create);
router.get('/', authMiddleware, checkRole('admin', 'teacher'), getAll);
router.get('/:id', authMiddleware, getById); // cualquier usuario logueado
router.get('/student/:student_id', authMiddleware, getByStudent); // alumno y padre
router.put('/:id', authMiddleware, checkRole('teacher'), update);
router.get('/exam/:examId/students', authMiddleware, checkRole('teacher'), getStudentsForExam);
router.post('/exam/:examId/bulk', authMiddleware, checkRole('teacher'), bulkSave);

module.exports = router;