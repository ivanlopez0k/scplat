require('dotenv').config({ path: '../.env' });
const models = require('../models');
const bcrypt = require('bcrypt');

const { User, Course, Enrollment } = models;

const STUDENT_NAMES = [
  { name: 'Lucas', lastname: 'García' },
  { name: 'Valentina', lastname: 'Rodríguez' },
  { name: 'Mateo', lastname: 'López' },
  { name: 'Sofía', lastname: 'Martínez' },
  { name: 'Benjamín', lastname: 'González' },
  { name: 'Isabella', lastname: 'Fernández' },
  { name: 'Santiago', lastname: 'Pérez' },
  { name: 'Emma', lastname: 'Sánchez' },
  { name: 'Thiago', lastname: 'Ramírez' },
  { name: 'Mía', lastname: 'Torres' },
  { name: 'Joaquín', lastname: 'Flores' },
  { name: 'Martina', lastname: 'Díaz' },
  { name: 'Felipe', lastname: 'Morales' },
  { name: 'Catalina', lastname: 'Vargas' },
  { name: 'Nicolás', lastname: 'Castro' },
];

const DEFAULT_PASSWORD = 'alumno123';
const COURSE_YEAR = 1;
const COURSE_NAME = 'A';

async function generateStudents() {
  try {
    await models.sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    // Find or create course 1° A
    let course = await Course.findOne({
      where: { year: COURSE_YEAR, name: COURSE_NAME }
    });

    if (!course) {
      course = await Course.create({ year: COURSE_YEAR, name: COURSE_NAME });
      console.log(`✅ Curso creado: ${COURSE_YEAR}° ${COURSE_NAME} (id: ${course.id})`);
    } else {
      console.log(`✅ Curso encontrado: ${COURSE_YEAR}° ${COURSE_NAME} (id: ${course.id})`);
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const created = [];
    let skipped = 0;

    for (const student of STUDENT_NAMES) {
      const email = `${student.name.toLowerCase()}.${student.lastname.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}@educar.com`;
      const dni = String(40000000 + Math.floor(Math.random() * 9999999));

      // Check if student already exists
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        console.log(`⏭️  ${student.name} ${student.lastname} ya existe`);
        skipped++;
        continue;
      }

      // Create student user
      const user = await User.create({
        name: student.name,
        lastname: student.lastname,
        dni,
        email,
        password: hashedPassword,
        role: 'student',
      });

      // Enroll in course
      await Enrollment.create({
        student_id: user.id,
        course_id: course.id,
        school_year: 2026,
      });

      created.push({ id: user.id, name: `${student.name} ${student.lastname}`, dni, email });
    }

    console.log('\n═══════════════════════════════════════');
    console.log(`✅ ${created.length} alumnos creados e inscriptos en ${COURSE_YEAR}° ${COURSE_NAME}`);
    if (skipped > 0) console.log(`⏭️  ${skipped} alumnos ya existentes (omitidos)`);
    console.log('═══════════════════════════════════════');
    console.log(`🔑 Contraseña por defecto: ${DEFAULT_PASSWORD}`);
    console.log('\nAlumnos creados:');
    created.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.name} (DNI: ${s.dni}) - ${s.email}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateStudents();
