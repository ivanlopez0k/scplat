const { Cs, Course, Subject } = require('../models');

async function createCourseSubject(course_id, subject_id) {

    const course = await Course.findByPk(course_id);
    if (!course) throw new Error('Curso no encontrado');

    const subject = await Subject.findByPk(subject_id);
    if (!subject) throw new Error('Materia no encontrada');

    const existing = await Cs.findOne({ where: { course_id, subject_id } });
    if (existing) throw new Error('Esa materia ya está asignada a ese curso');

    const cs = await Cs.create({ course_id, subject_id });
    return cs;
}

async function getCourseSubjects() {
    const cs = await Cs.findAll({
        include: [
            { model: Course, attributes: ['name', 'year'] },
            { model: Subject, attributes: ['name'] }
        ]
    });
    return cs;
}

async function getCourseSubjectById(id) {
    const cs = await Cs.findByPk(id, {
        include: [
            { model: Course, attributes: ['name', 'year'] },
            { model: Subject, attributes: ['name'] }
        ]
    });
    if (!cs) throw new Error('CourseSubject no encontrado');
    return cs;
}

async function deleteCourseSubject(id) {
    const cs = await Cs.findByPk(id);
    if (!cs) throw new Error('CourseSubject no encontrado');
    await cs.destroy();
    return { message: 'Eliminado correctamente' };
}

module.exports = { createCourseSubject, getCourseSubjects, getCourseSubjectById, deleteCourseSubject };