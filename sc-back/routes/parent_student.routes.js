const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');
const { create, getByParent, remove, update } = require('../controllers/parent_student.controller');

router.post('/', authMiddleware, checkRole('admin', 'parent'), create);
router.get('/:parent_id', authMiddleware, checkRole('admin', 'parent'), getByParent);
router.delete('/:id', authMiddleware, checkRole('admin'), remove);
router.put('/:parent_id', authMiddleware, checkRole('admin', 'parent'), update);

module.exports = router;