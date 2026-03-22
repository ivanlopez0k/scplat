const { Course } = require('../models');

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

module.exports = { createCourse, getCourses, getCourseById, updateCourse };