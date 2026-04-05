const { Enrollment, User, Course, Cs, Subject, Tc } = require('../models');

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
            { model: User, as: 'student', attributes: ['name', 'lastname'] },
            { model: Course, as: 'course', attributes: ['name', 'year'] }
        ]
    });
    return enrollments;
}

async function getEnrollmentById(id) {
    const enrollment = await Enrollment.findByPk(id, {
        include: [
            { model: User, as: 'student', attributes: ['name', 'lastname'] },
            { model: Course, as: 'course', attributes: ['name', 'year'] }
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

async function getEnrollmentsByStudent(student_id) {
    const student = await User.findByPk(student_id);
    if (!student) throw new Error('Usuario no encontrado');
    if (student.role !== 'student') throw new Error('El usuario no es un estudiante');

    const enrollments = await Enrollment.findAll({
        where: { student_id },
        include: [
            { model: Course, as: 'course', attributes: ['id', 'name', 'year'] }
        ]
    });
    return enrollments;
}

async function getStudentSubjects(student_id) {
    const student = await User.findByPk(student_id);
    if (!student) throw new Error('Usuario no encontrado');
    if (student.role !== 'student') throw new Error('El usuario no es un estudiante');

    // Get student's enrollment
    const enrollments = await Enrollment.findAll({
        where: { student_id },
        attributes: ['course_id']
    });

    if (enrollments.length === 0) return [];

    const courseIds = enrollments.map(e => e.course_id);

    // Get course_subjects for these courses with subjects and teachers
    const courseSubjects = await Cs.findAll({
        where: { course_id: courseIds },
        include: [
            { model: Subject, as: 'subject', attributes: ['id', 'name'] },
            {
                model: Tc,
                as: 'teacher_courses',
                include: [
                    { model: User, as: 'teacher', attributes: ['id', 'name', 'lastname', 'email'] }
                ]
            }
        ]
    });

    // Format response: one entry per subject with its teacher(s)
    const subjects = courseSubjects.map(cs => ({
        subject_id: cs.subject.id,
        subject_name: cs.subject.name,
        teachers: cs.teacher_courses.map(tc => ({
            id: tc.teacher.id,
            name: tc.teacher.name,
            lastname: tc.teacher.lastname,
            email: tc.teacher.email
        }))
    }));

    // Sort alphabetically by subject name
    subjects.sort((a, b) => a.subject_name.localeCompare(b.subject_name));

    return subjects;
}

async function getStudentsByCsId(csId) {
    const cs = await Cs.findByPk(csId, {
        include: [
            { model: Course, as: 'course', attributes: ['id', 'name', 'year'] },
            { model: Subject, as: 'subject', attributes: ['id', 'name'] }
        ]
    });
    if (!cs) throw new Error('CourseSubject no encontrado');

    // Get all students enrolled in this course
    const enrollments = await Enrollment.findAll({
        where: { course_id: cs.course_id },
        include: [
            { model: User, as: 'student', attributes: ['id', 'name', 'lastname', 'dni', 'email'] }
        ]
    });

    // Get exams created by teachers for this course-subject
    const { Exam, Grade } = require('../models');
    const exams = await Exam.findAll({
        where: { cs_id: csId },
        include: [
            { model: User, as: 'User', attributes: ['id', 'name', 'lastname'] }
        ],
        order: [['exam_date', 'ASC']]
    });

    // Get all grades for these exams
    const examIds = exams.map(e => e.id);
    const grades = examIds.length > 0
        ? await Grade.findAll({
            where: { exam_id: examIds },
            include: [
                { model: Exam, as: 'Exam', attributes: ['id', 'title', 'type', 'exam_date'] }
            ]
        })
        : [];

    // Build student list with grades
    const students = enrollments.map(enrollment => {
        const studentGrades = grades.filter(g => g.student_id === enrollment.student.id);
        return {
            student_id: enrollment.student.id,
            name: enrollment.student.name,
            lastname: enrollment.student.lastname,
            dni: enrollment.student.dni,
            email: enrollment.student.email,
            grades: studentGrades.map(g => ({
                exam_id: g.exam_id,
                exam_title: g.Exam?.title ?? '—',
                exam_type: g.Exam?.type ?? '—',
                exam_date: g.Exam?.exam_date ?? null,
                note: parseFloat(g.note)
            }))
        };
    });

    // Sort alphabetically by lastname
    students.sort((a, b) => a.lastname.localeCompare(b.lastname));

    return {
        course: {
            id: cs.course.id,
            name: cs.course.name,
            year: cs.course.year
        },
        subject: {
            id: cs.subject.id,
            name: cs.subject.name
        },
        students
    };
}

module.exports = { createEnrollment, getEnrollments, getEnrollmentById, deleteEnrollment, getEnrollmentsByStudent, getStudentSubjects, getStudentsByCsId };