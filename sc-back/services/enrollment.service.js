const { Enrollment, User, Course } = require('../models');

async function createEnrollment(student_id, course_id, school_year) {
    const student = await User.findByPk(student_id);
    if (!student) throw new Error('Usuario no encontrado');
    if (student.role !== 'student') throw new Error('El usuario no es un estudiante');

    const course = await Course.findByPk(course_id);
    if (!course) throw new Error('Curso no encontrado');

    const existing = await Enrollment.findOne({ where: { student_id, course_id, school_year } });
    if (existing) throw new Error('El estudiante ya está inscripto en ese curso para ese año');

    const enrollment = await Enrollment.create({ student_id, course_id, school_year });
    return enrollment;
}

async function getEnrollments() {
    const enrollments = await Enrollment.findAll({
        include: [
            { model: User, attributes: ['name', 'lastname'] },
            { model: Course, attributes: ['name', 'year'] }
        ]
    });
    return enrollments;
}

async function getEnrollmentById(id) {
    const enrollment = await Enrollment.findByPk(id, {
        include: [
            { model: User, attributes: ['name', 'lastname'] },
            { model: Course, attributes: ['name', 'year'] }
        ]
    });
    if (!enrollment) throw new Error('Inscripción no encontrada');
    return enrollment;
}

async function deleteEnrollment(id) {
    const enrollment = await Enrollment.findByPk(id);
    if (!enrollment) throw new Error('Inscripción no encontrada');
    await enrollment.destroy();
    return { message: 'Inscripción eliminada correctamente' };
}

module.exports = { createEnrollment, getEnrollments, getEnrollmentById, deleteEnrollment };