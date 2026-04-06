require('dotenv').config({ path: '../.env' });
const models = require('../models');

const { Exam, Cs, Course, Subject, User, Enrollment, Grade } = models;

const COURSE_ID = 4; // 1° A
const SUBJECT_NAME = 'Matemática';
const EXAM_NUMBER = '1';

async function generateRandomGrades() {
  try {
    await models.sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    // 1. Find the Math subject
    const mathSubject = await Subject.findOne({
      where: { name: SUBJECT_NAME }
    });

    if (!mathSubject) {
      console.error(`❌ No se encontró la materia "${SUBJECT_NAME}"`);
      process.exit(1);
    }
    console.log(`✅ Materia encontrada: ${mathSubject.name} (id: ${mathSubject.id})`);

    // 2. Find the course_subject link
    const cs = await Cs.findOne({
      where: { course_id: COURSE_ID, subject_id: mathSubject.id },
      include: [
        { model: Subject, as: 'subject', attributes: ['name'] },
        { model: Course, as: 'course', attributes: ['name', 'year'] }
      ]
    });

    if (!cs) {
      console.error(`❌ No se encontró el curso-materia: ${COURSESE_ID} + ${SUBJECT_NAME}`);
      process.exit(1);
    }
    console.log(`✅ Course-Subject encontrado (id: ${cs.id})`);

    // 3. Find the first Math exam
    const exam = await Exam.findOne({
      where: { cs_id: cs.id, exam_number: EXAM_NUMBER },
      include: [
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

    if (!exam) {
      console.error(`❌ No se encontró la evaluación #${EXAM_NUMBER} de ${SUBJECT_NAME} para ${COURSE_ID}° A`);
      process.exit(1);
    }
    console.log(`✅ Evaluación encontrada: "${exam.title}" (id: ${exam.id})`);

    // 4. Get all enrolled students
    const enrollments = await Enrollment.findAll({
      where: { course_id: COURSE_ID },
      include: [{ model: User, as: 'student', attributes: ['id', 'name', 'lastname', 'dni'] }]
    });

    if (enrollments.length === 0) {
      console.error(`❌ No hay alumnos inscriptos en el curso`);
      process.exit(1);
    }
    console.log(`\n📋 ${enrollments.length} alumnos encontrados`);

    // 5. Generate random grades (0-100)
    const grades = [];
    for (const enrollment of enrollments) {
      const studentId = enrollment.student.id;
      const note = Math.floor(Math.random() * 101); // 0 to 100

      const existing = await Grade.findOne({
        where: { exam_id: exam.id, student_id: studentId }
      });

      if (existing) {
        await existing.update({ note });
        grades.push({ student: `${enrollment.student.lastname}, ${enrollment.student.name}`, note, action: 'updated' });
      } else {
        await Grade.create({ exam_id: exam.id, student_id: studentId, note });
        grades.push({ student: `${enrollment.student.lastname}, ${enrollment.student.name}`, note, action: 'created' });
      }
    }

    // 6. Summary
    console.log('\n══════════════════════════════════════════════════════════');
    console.log(`📊 Notas asignadas para: "${exam.title}"`);
    console.log('══════════════════════════════════════════════════════════');
    console.log('  Alumno                              | Nota | Estado');
    console.log('  ────────────────────────────────────|──────|────────');
    grades.forEach((g, i) => {
      const numStr = g.note.toString().padStart(4, ' ');
      const actionStr = g.action === 'updated' ? 'Actualizada' : 'Creada';
      console.log(`  ${i + 1}. ${g.student.padEnd(35)}|${numStr}  | ${actionStr}`);
    });
    console.log('══════════════════════════════════════════════════════════');

    // Stats
    const notes = grades.map(g => g.note);
    const avg = (notes.reduce((a, b) => a + b, 0) / notes.length).toFixed(1);
    const max = Math.max(...notes);
    const min = Math.min(...notes);
    const approved = notes.filter(n => n >= 40).length;
    console.log(`  Promedio: ${avg} | Máx: ${max} | Mín: ${min} | Aprobados: ${approved}/${notes.length} (${((approved / notes.length) * 100).toFixed(0)}%)`);
    console.log('══════════════════════════════════════════════════════════');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateRandomGrades();
