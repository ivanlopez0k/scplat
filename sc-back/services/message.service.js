const { Message, User, Ps, Tc, Cs, Enrollment, Course, Subject } = require('../models');

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

async function getTeacherContacts(teacherId) {
    // Get all cs_ids for this teacher
    const teacherCs = await Tc.findAll({
        where: { teacher_id: teacherId },
        attributes: ['cs_id']
    });

    if (teacherCs.length === 0) return [];

    const csIds = teacherCs.map(tc => tc.cs_id);

    // Get course_ids from these cs_ids
    const coursesSubjects = await Cs.findAll({
        where: { id: csIds },
        attributes: ['course_id']
    });

    if (coursesSubjects.length === 0) return [];

    const courseIds = [...new Set(coursesSubjects.map(cs => cs.course_id))];

    // Get all students enrolled in these courses
    const enrollments = await Enrollment.findAll({
        where: { course_id: courseIds },
        attributes: ['student_id']
    });

    if (enrollments.length === 0) return [];

    const studentIds = [...new Set(enrollments.map(e => e.student_id))];

    // Get parents of these students
    const parentStudents = await Ps.findAll({
        where: { student_id: studentIds },
        include: [
            { model: User, as: 'parent', attributes: ['id', 'name', 'lastname', 'email'] },
            { model: User, as: 'student', attributes: ['id', 'name', 'lastname'] }
        ]
    });

    // Build unique parent list with their student(s)
    const parentMap = {};
    parentStudents.forEach(ps => {
        const parentId = ps.parent_id;
        if (!parentMap[parentId]) {
            parentMap[parentId] = {
                id: ps.parent.id,
                name: ps.parent.name,
                lastname: ps.parent.lastname,
                email: ps.parent.email,
                students: []
            };
        }
        parentMap[parentId].students.push({
            id: ps.student.id,
            name: ps.student.name,
            lastname: ps.student.lastname
        });
    });

    // Convert to array and sort by lastname
    const parents = Object.values(parentMap);
    parents.sort((a, b) => a.lastname.localeCompare(b.lastname));

    return parents;
}

async function getParentContacts(parentId) {
    // Get all students linked to this parent
    const parentStudents = await Ps.findAll({
        where: { parent_id: parentId },
        attributes: ['student_id']
    });

    if (parentStudents.length === 0) return [];

    const studentIds = [...new Set(parentStudents.map(ps => ps.student_id))];

    // Get all courses these students are enrolled in
    const enrollments = await Enrollment.findAll({
        where: { student_id: studentIds },
        attributes: ['course_id']
    });

    if (enrollments.length === 0) return [];

    const courseIds = [...new Set(enrollments.map(e => e.course_id))];

    // Get all cs_ids for these courses
    const courseSubjects = await Cs.findAll({
        where: { course_id: courseIds },
        attributes: ['id']
    });

    if (courseSubjects.length === 0) return [];

    const csIds = courseSubjects.map(cs => cs.id);

    // Get all teachers for these course_subjects
    try {
        const teacherCourses = await Tc.findAll({
            where: { cs_id: csIds },
            include: [
                { model: User, as: 'teacher', attributes: ['id', 'name', 'lastname', 'email'] },
                {
                    model: Cs,
                    as: 'cs',
                    include: [
                        { model: Subject, as: 'subject', attributes: ['id', 'name'] }
                    ]
                }
            ]
        });

        // Build unique teacher list with their subject(s)
        const teacherMap = {};
        teacherCourses.forEach(tc => {
            const teacherId = tc.teacher_id;
            if (!teacherMap[teacherId]) {
                teacherMap[teacherId] = {
                    id: tc.teacher.id,
                    name: tc.teacher.name,
                    lastname: tc.teacher.lastname,
                    email: tc.teacher.email,
                    subjects: []
                };
            }
            const subjectName = tc.cs?.subject?.name;
            if (subjectName && !teacherMap[teacherId].subjects.includes(subjectName)) {
                teacherMap[teacherId].subjects.push(subjectName);
            }
        });

        // Convert to array and sort by lastname
        const teachers = Object.values(teacherMap);
        teachers.sort((a, b) => a.lastname.localeCompare(b.lastname));

        return teachers;
    } catch (err) {
        console.error('[getParentContacts] Error fetching teachers:', err.message);
        return [];
    }
}

module.exports = { createMessage, getMessagesBetweenUsers, markAsRead, getUnreadMessages, getTeacherContacts, getParentContacts };