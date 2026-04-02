const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');
const { create, getAll, getById, update, remove } = require('../controllers/course.controller');

router.post('/', authMiddleware, checkRole('admin'), create);
router.get('/', authMiddleware, getAll);
router.get('/:id', authMiddleware, getById);
router.put('/:id', authMiddleware, checkRole('admin'), update);
router.delete('/:id', authMiddleware, checkRole('admin'), remove);

module.exports = router;