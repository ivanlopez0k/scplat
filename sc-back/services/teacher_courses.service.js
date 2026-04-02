const { Tc, User, Cs, Course, Subject } = require('../models');

async function createTeacherCourse(teacher_id, cs_id) {
    // verificamos que el usuario exista y sea profesor
    const teacher = await User.findByPk(teacher_id);
    if (!teacher) throw new Error('Usuario no encontrado');
    if (teacher.role !== 'teacher') throw new Error('El usuario no es un profesor');

    // verificamos que el course_subject exista
    const cs = await Cs.findByPk(cs_id);
    if (!cs) throw new Error('CourseSubject no encontrado');

    // verificamos que no exista ya esa combinación
    const existing = await Tc.findOne({ where: { teacher_id, cs_id } });
    if (existing) throw new Error('Ese profesor ya está asignado a ese curso/materia');

    const tc = await Tc.create({ teacher_id, cs_id });
    return tc;
}

async function getTeacherCourses() {
    const tc = await Tc.findAll({
        include: [
            { model: User, as: 'teacher', attributes: ['name', 'lastname'] },
            {
                model: Cs,
                as: 'cs',
                include: [
                    { model: Course, as: 'course', attributes: ['name', 'year'] },
                    { model: Subject, as: 'subject', attributes: ['name'] }
                ]
            }
        ]
    });
    return tc;
}

async function getTeacherCourseById(id) {
    const tc = await Tc.findByPk(id, {
        include: [
            { model: User, as: 'teacher', attributes: ['name', 'lastname'] },
            {
                model: Cs,
                as: 'cs',
                include: [
                    { model: Course, as: 'course', attributes: ['name', 'year'] },
                    { model: Subject, as: 'subject', attributes: ['name'] }
                ]
            }
        ]
    });
    if (!tc) throw new Error('TeacherCourse no encontrado');
    return tc;
}

async function deleteTeacherCourse(id) {
    const tc = await Tc.findByPk(id);
    if (!tc) throw new Error('TeacherCourse no encontrado');
    await tc.destroy();
    return { message: 'Eliminado correctamente' };
}

module.exports = { createTeacherCourse, getTeacherCourses, getTeacherCourseById, deleteTeacherCourse };