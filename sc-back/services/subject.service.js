const { Subject, Cs } = require('../models');

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

async function deleteSubject(id) {
    const subject = await Subject.findByPk(id);
    if (!subject) throw new Error('Materia no encontrada');
    
    // Verificar si está siendo usada en algún course_subject
    const courseSubjects = await Cs.findAll({ where: { subject_id: id } });
    
    // Si está en uso, eliminar las relaciones primero
    if (courseSubjects.length > 0) {
        // Eliminar todas las asignaciones de profesores a este course_subject
        const { Tc } = require('../models');
        for (const cs of courseSubjects) {
            await Tc.destroy({ where: { cs_id: cs.id } });
        }
        
        // Eliminar los course_subjects
        await Cs.destroy({ where: { subject_id: id } });
    }
    
    await subject.destroy();
    return { message: 'Materia eliminada correctamente' };
}

module.exports = { createSubject, getSubjects, getSubjectById, updateSubject, deleteSubject };