const { Grade, User, Exam, Cs, Enrollment, Subject, Course, Sequelize } = require('../models');

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

async function getStudentsByExam(examId) {
    const exam = await Exam.findByPk(examId, {
        include: [
            {
                model: Cs,
                as: 'Cs',
                include: [
                    { model: Course, as: 'course', attributes: ['id', 'name', 'year'] }
                ]
            }
        ]
    });
    if (!exam) throw new Error('Examen no encontrado');

    // Get all students enrolled in this course
    const enrollments = await Enrollment.findAll({
        where: { course_id: exam.Cs.course_id },
        include: [
            { model: User, as: 'student', attributes: ['id', 'name', 'lastname', 'dni'] }
        ]
    });

    // Get existing grades for this exam
    const existingGrades = await Grade.findAll({
        where: { exam_id: examId },
        attributes: ['student_id', 'id', 'note']
    });

    const gradeMap = {};
    existingGrades.forEach(g => {
        gradeMap[g.student_id] = { gradeId: g.id, note: parseFloat(g.note) };
    });

    // Build response: all enrolled students with their grade (or null)
    const students = enrollments.map(enrollment => ({
        student_id: enrollment.student.id,
        name: enrollment.student.name,
        lastname: enrollment.student.lastname,
        dni: enrollment.student.dni,
        grade: gradeMap[enrollment.student.id] || null
    }));

    // Sort alphabetically by lastname
    students.sort((a, b) => a.lastname.localeCompare(b.lastname));

    return students;
}

async function bulkUpsertGrades(examId, grades) {
    // grades: [{ student_id, note }, ...]
    const exam = await Exam.findByPk(examId);
    if (!exam) throw new Error('Examen no encontrado');

    for (const { student_id, note } of grades) {
        if (note < 0 || note > 100) {
            throw new Error(`Nota inválida para alumno ${student_id}: debe estar entre 0 y 100`);
        }

        const existing = await Grade.findOne({ where: { exam_id: examId, student_id } });
        if (existing) {
            await existing.update({ note });
        } else {
            await Grade.create({ exam_id: examId, student_id, note });
        }
    }

    return { message: `Se guardaron ${grades.length} notas correctamente` };
}

// Get top 5 students by course based on average grade
async function getTopStudentsByCourse(studentId) {
    // First, find the course the student is enrolled in
    const studentEnrollment = await Enrollment.findOne({
        where: { student_id: studentId },
        include: [
            { model: Course, as: 'course', attributes: ['id', 'name', 'year'] }
        ]
    });

    if (!studentEnrollment) {
        return { course: null, topStudents: [] };
    }

    const courseId = studentEnrollment.course_id;
    const course = studentEnrollment.course;

    // Get all students enrolled in this course
    const enrollments = await Enrollment.findAll({
        where: { course_id: courseId },
        attributes: ['student_id']
    });

    if (enrollments.length === 0) {
        return { course, topStudents: [] };
    }

    const studentIds = enrollments.map(e => e.student_id);

    // Calculate average grade for each student
    const studentAverages = await Grade.findAll({
        where: {
            student_id: studentIds
        },
        include: [
            {
                model: User,
                attributes: ['id', 'name', 'lastname', 'dni']
            }
        ],
        attributes: [
            'student_id',
            [Sequelize.fn('AVG', Sequelize.col('note')), 'average']
        ],
        group: ['student_id', 'User.id']
    });

    // Build the list of students with their averages
    const studentsWithAverages = studentAverages.map(record => ({
        student_id: record.student_id,
        name: record.User.name,
        lastname: record.User.lastname,
        dni: record.User.dni,
        average: parseFloat(record.dataValues.average) // Convert to number
    }));

    // Sort by average (descending) and take top 5
    studentsWithAverages.sort((a, b) => b.average - a.average);
    const topStudents = studentsWithAverages.slice(0, 5);

    return { course, topStudents };
}

module.exports = { createGrade, getGrades, getGradeById, getGradesByStudent, updateGrade, getStudentsByExam, bulkUpsertGrades, getTopStudentsByCourse };