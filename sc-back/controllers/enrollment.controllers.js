const { createEnrollment, getEnrollments, getEnrollmentById, deleteEnrollment, getEnrollmentsByStudent } = require('../services/enrollment.service');

async function create(req, res) {
    try {
        const { student_id, course_id, school_year } = req.body;
        const enrollment = await createEnrollment(student_id, course_id, school_year);
        res.status(201).json(enrollment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getAll(req, res) {
    try {
        const enrollments = await getEnrollments();
        res.status(200).json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getById(req, res) {
    try {
        const { id } = req.params;
        const enrollment = await getEnrollmentById(id);
        res.status(200).json(enrollment);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

async function remove(req, res) {
    try {
        const { id } = req.params;
        const result = await deleteEnrollment(id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getByStudent(req, res) {
    try {
        const { student_id } = req.params;
        const enrollments = await getEnrollmentsByStudent(student_id);
        res.status(200).json(enrollments);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

module.exports = { create, getAll, getById, remove, getByStudent };