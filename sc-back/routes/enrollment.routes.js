const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');
const { create, getAll, getById, remove } = require('../controllers/enrollment.controllers');

router.post('/', authMiddleware, checkRole('admin'), create);
router.get('/', authMiddleware, checkRole('admin'), getAll);
router.get('/:id', authMiddleware, checkRole('admin'), getById);
router.delete('/:id', authMiddleware, checkRole('admin'), remove);

module.exports = router;