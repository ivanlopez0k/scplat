const { createTeacherCourse, getTeacherCourses, getTeacherCourseById, deleteTeacherCourse } = require('../services/teacher_courses.service');

async function create(req, res){
    try{
        const { teacher_id, cs_id } = req.body;
        const tc = await createTeacherCourse(teacher_id, cs_id);
        res.status(201).json(tc);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function getAll(req, res) {
    try {
        const tc = await getTeacherCourses();
        res.status(200).json(tc);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getById(req, res) {
    try {
        const { id } = req.params;
        const tc = await getTeacherCourseById(id);
        res.status(200).json(tc);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

async function remove(req, res) {
    try {
        const { id } = req.params;
        const result = await deleteTeacherCourse(id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { create, getAll, getById, remove };