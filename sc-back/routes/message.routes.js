const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');
const { create, getConversation, readMessage, getUnread } = require('../controllers/message.controller');

router.post('/', authMiddleware, checkRole('teacher', 'parent'), create);
router.get('/conversation/:user1_id/:user2_id', authMiddleware, getConversation);
router.get('/unread/:user_id', authMiddleware, getUnread);
router.put('/read/:id', authMiddleware, readMessage);

module.exports = router;