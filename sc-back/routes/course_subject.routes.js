const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');
const { create, getAll, getById, remove, getByCourse } = require('../controllers/course_subject.controller');

router.post('/',authMiddleware, checkRole('admin'), create);
router.get('/', authMiddleware, getAll);
router.get('/:id', authMiddleware, getById);
router.delete('/:id', authMiddleware, checkRole('admin'), remove);
router.get('/course/:course_id', authMiddleware, getByCourse);

module.exports = router;