const { Course, Cs } = require('../models');

async function createCourse(name, year) {
    const course = await Course.create({ name, year });
    return course;
}

async function getCourses() {
    const courses = await Course.findAll();
    return courses;
}

async function getCourseById(id) {
    const course = await Course.findByPk(id);
    if (!course) throw new Error('Curso no encontrado');
    return course;
}

async function updateCourse(id, name, year) {
    const course = await Course.findByPk(id);
    if (!course) throw new Error('Curso no encontrado');
    await course.update({ name, year });
    return course;
}

async function deleteCourse(id) {
    const course = await Course.findByPk(id);
    if (!course) throw new Error('Curso no encontrado');
    
    // Verificar si está siendo usado en algún course_subject
    const courseSubjects = await Cs.findAll({ where: { course_id: id } });
    
    // Si está en uso, eliminar las relaciones primero
    if (courseSubjects.length > 0) {
        // Eliminar todas las asignaciones de profesores a este course_subject
        const { Tc } = require('../models');
        for (const cs of courseSubjects) {
            await Tc.destroy({ where: { cs_id: cs.id } });
        }
        
        // Eliminar los course_subjects
        await Cs.destroy({ where: { course_id: id } });
    }
    
    await course.destroy();
    return { message: 'Curso eliminado correctamente' };
}

module.exports = { createCourse, getCourses, getCourseById, updateCourse, deleteCourse };