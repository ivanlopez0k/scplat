const { Exam, User, Cs, Tc, Course, Subject } = require('../models');

async function createExam(cs_id, teacher_id, title, type, exam_number, exam_date) {
    const teacher = await User.findByPk(teacher_id);
    if (!teacher) throw new Error('Usuario no encontrado');
    if (teacher.role !== 'teacher') throw new Error('El usuario no es un profesor');

    const cs = await Cs.findByPk(cs_id);
    if (!cs) throw new Error('CourseSubject no encontrado');

    // verificamos que el profesor esté asignado a ese course_subject
    const tc = await Tc.findOne({ where: { teacher_id, cs_id } });
    if (!tc) throw new Error('El profesor no está asignado a ese curso/materia');

    const exam = await Exam.create({ cs_id, teacher_id, title, type, exam_number, exam_date });
    return exam;
}

async function getExams() {
    const exams = await Exam.findAll({
        include: [
            { model: User, attributes: ['name', 'lastname'] },
            {
                model: Cs,
                include: [
                    { model: Course, attributes: ['name', 'year'] },
                    { model: Subject, attributes: ['name'] }
                ]
            }
        ]
    });
    return exams;
}

async function getExamById(id) {
    const exam = await Exam.findByPk(id, {
        include: [
            { model: User, attributes: ['name', 'lastname'] },
            {
                model: Cs,
                include: [
                    { model: Course, attributes: ['name', 'year'] },
                    { model: Subject, attributes: ['name'] }
                ]
            }
        ]
    });
    if (!exam) throw new Error('Examen no encontrado');
    return exam;
}

async function updateExam(id, title, type, exam_number, exam_date) {
    const exam = await Exam.findByPk(id);
    if (!exam) throw new Error('Examen no encontrado');
    await exam.update({ title, type, exam_number, exam_date });
    return exam;
}

async function deleteExam(id) {
    const exam = await Exam.findByPk(id);
    if (!exam) throw new Error('Examen no encontrado');
    await exam.destroy();
    return { message: 'Examen eliminado correctamente' };
}

module.exports = { createExam, getExams, getExamById, updateExam, deleteExam };