const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');
const { create, getAll, getById, getByStudent, update } = require('../controllers/grade.controller');

router.post('/', authMiddleware, checkRole('teacher'), create);
router.get('/', authMiddleware, checkRole('admin', 'teacher'), getAll);
router.get('/:id', authMiddleware, getById); // cualquier usuario logueado
router.get('/student/:student_id', authMiddleware, getByStudent); // alumno y padre
router.put('/:id', authMiddleware, checkRole('teacher'), update);

module.exports = router;