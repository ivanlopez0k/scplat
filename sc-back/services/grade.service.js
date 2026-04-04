const { Grade, User, Exam, Cs, Enrollment, Subject } = require('../models');

async function createGrade(exam_id, student_id, note) {
    const student = await User.findByPk(student_id);
    if (!student) throw new Error('Usuario no encontrado');
    if (student.role !== 'student') throw new Error('El usuario no es un estudiante');

const exam = await Exam.findByPk(exam_id);
if (!exam) throw new Error('Examen no encontrado');

const cs = await Cs.findByPk(exam.cs_id);
if (!cs) throw new Error('CourseSubject no encontrado');

const enrollment = await Enrollment.findOne({ 
    where: { 
        student_id, 
        course_id: cs.course_id 
    } 
});
    if (!enrollment) throw new Error('El alumno no está inscripto en el curso de ese examen');

    // verificamos que no exista ya una nota para ese alumno en ese examen
    const existing = await Grade.findOne({ where: { exam_id, student_id } });
    if (existing) throw new Error('Ya existe una nota para ese alumno en ese examen');

    const grade = await Grade.create({ exam_id, student_id, note });
    return grade;
}

async function getGrades() {
    const grades = await Grade.findAll({
        include: [
            { model: User, attributes: ['name', 'lastname'] },
            { model: Exam, attributes: ['title', 'type', 'exam_date'] }
        ]
    });
    return grades;
}

async function getGradeById(id) {
    const grade = await Grade.findByPk(id, {
        include: [
            { model: User, attributes: ['name', 'lastname'] },
            { model: Exam, attributes: ['title', 'type', 'exam_date'] }
        ]
    });
    if (!grade) throw new Error('Nota no encontrada');
    return grade;
}

async function getGradesByStudent(student_id) {
    const student = await User.findByPk(student_id);
    if (!student) throw new Error('Usuario no encontrado');
    if (student.role !== 'student') throw new Error('El usuario no es un estudiante');

    const grades = await Grade.findAll({
        where: { student_id },
        include: [
            {
                model: Exam,
                attributes: ['id', 'title', 'type', 'exam_date'],
                include: [
                    {
                        model: Cs,
                        as: 'Cs',
                        attributes: ['id'],
                        include: [
                            { model: Subject, as: 'subject', attributes: ['id', 'name'] }
                        ]
                    }
                ]
            }
        ]
    });
    return grades;
}

async function updateGrade(id, note) {
    const grade = await Grade.findByPk(id);
    if (!grade) throw new Error('Nota no encontrada');
    await grade.update({ note });
    return grade;
}

module.exports = { createGrade, getGrades, getGradeById, getGradesByStudent, updateGrade };