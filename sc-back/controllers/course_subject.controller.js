const { createCourseSubject, getCourseSubjects, getCourseSubjectById, deleteCourseSubject, getCourseSubjectsByCourse } = require('../services/course_subject.service');

async function create(req, res) {
    try {
        const { course_id, subject_id } = req.body;
        const cs = await createCourseSubject(course_id, subject_id);
        res.status(201).json(cs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getAll(req, res) {
    try {
        const cs = await getCourseSubjects();
        res.status(200).json(cs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getById(req, res) {
    try {
        const { id } = req.params;
        const cs = await getCourseSubjectById(id);
        res.status(200).json(cs);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

async function remove(req, res) {
    try {
        const { id } = req.params;
        const result = await deleteCourseSubject(id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getByCourse(req, res) {
    try {
        const { course_id } = req.params;
        const csList = await getCourseSubjectsByCourse(course_id);
        res.status(200).json(csList);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

module.exports = { create, getAll, getById, remove, getByCourse };