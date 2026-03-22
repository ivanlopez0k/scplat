const { createCourse, getCourses, getCourseById, updateCourse } = require('../services/course.service');

async function create(req, res){
    try {
        const { name, year } = req.body;
        const course = await createCourse(name, year);
        res.status(201).json(course);
    } catch(err){
        res.status(500).json({message: err.message});
    }
}

async function getAll(req, res){
    try {
        const courses = await getCourses();
        res.status(200).json(courses);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

async function getById(req, res) {
    try {
        const { id } = req.params;
        const course = await getCourseById(id);
        res.status(200).json(course);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

async function update(req, res) {
    try {
        const { id } = req.params;
        const { name, year } = req.body;
        const course = await updateCourse(id, name, year);
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { create, getAll, getById, update };