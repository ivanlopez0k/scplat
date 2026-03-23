const express = require('express');
const router = express.Router();
const { create, getConversation, readMessage, getUnread } = require('../controllers/message.controller');

router.post('/', create);
router.get('/conversation/:user1_id/:user2_id', getConversation);
router.get('/unread/:user_id', getUnread);
router.put('/read/:id', readMessage);

module.exports = router;