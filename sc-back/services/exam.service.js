const { Exam, User, Cs, Tc, Course, Subject, Enrollment } = require('../models');

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
                as: 'Cs',
                include: [
                    { model: Course, as: 'course', attributes: ['name', 'year'] },
                    { model: Subject, as: 'subject', attributes: ['name'] }
                ]
            }
        ],
        order: [['exam_date', 'ASC']]
    });
    return exams;
}

async function getExamById(id) {
    const exam = await Exam.findByPk(id, {
        include: [
            { model: User, attributes: ['name', 'lastname'] },
            {
                model: Cs,
                as: 'Cs',
                include: [
                    { model: Course, as: 'course', attributes: ['name', 'year'] },
                    { model: Subject, as: 'subject', attributes: ['name'] }
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

async function deleteExam(id, teacherId) {
    const exam = await Exam.findByPk(id);
    if (!exam) throw new Error('Examen no encontrado');
    if (exam.teacher_id !== teacherId) throw new Error('No tienes permiso para eliminar este examen');
    await exam.destroy();
    return { message: 'Examen eliminado correctamente' };
}

async function getExamsByCsId(csId) {
    const exams = await Exam.findAll({
        where: { cs_id: csId },
        include: [
            { model: User, attributes: ['name', 'lastname'] },
            {
                model: Cs,
                as: 'Cs',
                include: [
                    { model: Course, as: 'course', attributes: ['name', 'year'] },
                    { model: Subject, as: 'subject', attributes: ['name'] }
                ]
            }
        ],
        order: [['exam_date', 'ASC']]
    });
    console.log(`[getExamsByCsId] csId=${csId}, found ${exams.length} exams`);
    return exams;
}

async function getExamsByStudentId(studentId) {
    // Primero obtenemos los cursos en los que está inscripto el alumno
    const enrollments = await Enrollment.findAll({
        where: { student_id: studentId },
        attributes: ['course_id']
    });

    console.log(`[getExamsByStudentId] studentId=${studentId}, enrollments=${enrollments.length}`);

    if (enrollments.length === 0) return [];

    const courseIds = enrollments.map(e => e.course_id);
    console.log(`[getExamsByStudentId] courseIds=${JSON.stringify(courseIds)}`);

    // Ahora obtenemos los examenes de esos cursos
    // Necesitamos encontrar los cs_id que pertenecen a estos courses
    const courseSubjects = await Cs.findAll({
        where: { course_id: courseIds },
        attributes: ['id']
    });

    console.log(`[getExamsByStudentId] courseSubjects=${courseSubjects.length}`);

    if (courseSubjects.length === 0) return [];

    const csIds = courseSubjects.map(cs => cs.id);
    console.log(`[getExamsByStudentId] csIds=${JSON.stringify(csIds)}`);

    // Finalmente obtenemos los examenes de esos cs_id
    const exams = await Exam.findAll({
        where: { cs_id: csIds },
        include: [
            { model: User, attributes: ['name', 'lastname'] },
            {
                model: Cs,
                as: 'Cs',
                include: [
                    { model: Course, as: 'course', attributes: ['name', 'year'] },
                    { model: Subject, as: 'subject', attributes: ['name'] }
                ]
            }
        ],
        order: [['exam_date', 'ASC']]
    });

    console.log(`[getExamsByStudentId] found ${exams.length} exams`);
    return exams;
}

module.exports = { createExam, getExams, getExamById, updateExam, deleteExam, getExamsByCsId, getExamsByStudentId };