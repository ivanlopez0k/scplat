const { Subject } = require('../models');

async function createSubject(name) {
    const subject = await Subject.create({ name });
    return subject;
}

async function getSubjects() {
    const subjects = await Subject.findAll();
    return subjects;
}

async function getSubjectById(id) {
    const subject = await Subject.findByPk(id);
    if (!subject) throw new Error('Materia no encontrada');
    return subject;
}

async function updateSubject(id, name) {
    const subject = await Subject.findByPk(id);
    if (!subject) throw new Error('Materia no encontrada');
    await subject.update({ name });
    return subject;
}

module.exports = { createSubject, getSubjects, getSubjectById, updateSubject };