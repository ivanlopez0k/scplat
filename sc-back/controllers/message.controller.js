const { createMessage, getMessagesBetweenUsers, markAsRead, getUnreadMessages } = require('../services/message.service');

async function create(req, res) {
    try {
        const { sender, receiver, content } = req.body;
        const message = await createMessage(sender, receiver, content);
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getConversation(req, res) {
    try {
        const { user1_id, user2_id } = req.params;
        const messages = await getMessagesBetweenUsers(user1_id, user2_id);
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function readMessage(req, res) {
    try {
        const { id } = req.params;
        const { user_id } = req.body;
        const message = await markAsRead(id, user_id);
        res.status(200).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getUnread(req, res) {
    try {
        const { user_id } = req.params;
        const messages = await getUnreadMessages(user_id);
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { create, getConversation, readMessage, getUnread };