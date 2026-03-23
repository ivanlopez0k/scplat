const { createGrade, getGrades, getGradeById, getGradesByStudent, updateGrade } = require('../services/grade.service');

async function create(req, res) {
    try {
        const { exam_id, student_id, note } = req.body;
        const grade = await createGrade(exam_id, student_id, note);
        res.status(201).json(grade);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getAll(req, res) {
    try {
        const grades = await getGrades();
        res.status(200).json(grades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getById(req, res) {
    try {
        const { id } = req.params;
        const grade = await getGradeById(id);
        res.status(200).json(grade);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

async function getByStudent(req, res) {
    try {
        const { student_id } = req.params;
        const grades = await getGradesByStudent(student_id);
        res.status(200).json(grades);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

async function update(req, res) {
    try {
        const { id } = req.params;
        const { note } = req.body;
        const grade = await updateGrade(id, note);
        res.status(200).json(grade);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { create, getAll, getById, getByStudent, update };