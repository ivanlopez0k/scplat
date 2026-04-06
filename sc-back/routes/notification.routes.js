const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');
const { getAll, getUnread, markRead, markAllRead } = require('../controllers/notification.controller');

// All routes require authentication and student role
router.use(authMiddleware);
router.use(checkRole('student'));

router.get('/', getAll);
router.get('/unread-count', getUnread);
router.post('/:id/read', markRead);
router.post('/read-all', markAllRead);

module.exports = router;
