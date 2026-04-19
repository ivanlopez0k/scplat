const { createExam, getExams, getExamById, updateExam, deleteExam, getExamsByStudentId, getExamsByCsId } = require('../services/exam.service');

async function create(req, res) {
    try {
        const { cs_id, teacher_id, title, type, exam_number, exam_date } = req.body;
        const exam = await createExam(cs_id, teacher_id, title, type, exam_number, exam_date);
        res.status(201).json(exam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getAll(req, res) {
    try {
        const exams = await getExams();
        res.status(200).json(exams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getById(req, res) {
    try {
        const { id } = req.params;
        const exam = await getExamById(id);
        res.status(200).json(exam);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

async function update(req, res) {
    try {
        const { id } = req.params;
        const { title, type, exam_number, exam_date } = req.body;
        const exam = await updateExam(id, title, type, exam_number, exam_date);
        res.status(200).json(exam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function remove(req, res) {
    try {
        const { id } = req.params;
        const teacherId = req.user.id;
        const result = await deleteExam(id, teacherId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getByStudent(req, res) {
    try {
        const { studentId } = req.params;
        const exams = await getExamsByStudentId(studentId);
        res.status(200).json(exams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getByCsId(req, res) {
    try {
        const { csId } = req.params;
        const exams = await getExamsByCsId(csId);
        res.status(200).json(exams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { create, getAll, getById, update, remove, getByStudent, getByCsId };