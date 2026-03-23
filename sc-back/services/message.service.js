const { Message, User } = require('../models');

async function createMessage(sender_id, receiver_id, content) {
    const sender = await User.findByPk(sender_id);
    if (!sender) throw new Error('Sender no encontrado');
    if (sender.role === 'student') throw new Error('Los alumnos no pueden enviar mensajes');

    const receiver = await User.findByPk(receiver_id);
    if (!receiver) throw new Error('Receiver no encontrado');
    if (receiver.role === 'student') throw new Error('No se puede enviar mensajes a un alumno');

    const message = await Message.create({ sender: sender_id, receiver: receiver_id, content });
    return message;
}

async function getMessagesBetweenUsers(user1_id, user2_id) {
    const { Op } = require('sequelize');
    const messages = await Message.findAll({
        where: {
            [Op.or]: [
                { sender: user1_id, receiver: user2_id },
                { sender: user2_id, receiver: user1_id }
            ]
        },
        include: [
            { model: User, as: 'Sender', attributes: ['name', 'lastname'] },
            { model: User, as: 'Receiver', attributes: ['name', 'lastname'] }
        ],
        order: [['created_at', 'ASC']]
    });
    return messages;
}

async function markAsRead(id, user_id) {
    const message = await Message.findByPk(id);
    if (!message) throw new Error('Mensaje no encontrado');
    if (message.receiver !== user_id) throw new Error('No tenés permiso para marcar este mensaje como leído');
    await message.update({ is_read: true });
    return message;
}

async function getUnreadMessages(user_id) {
    const messages = await Message.findAll({
        where: { receiver: user_id, is_read: false },
        include: [
            { model: User, as: 'Sender', attributes: ['name', 'lastname'] }
        ],
        order: [['created_at', 'ASC']]
    });
    return messages;
}

module.exports = { createMessage, getMessagesBetweenUsers, markAsRead, getUnreadMessages };