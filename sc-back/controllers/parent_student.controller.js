const { createParentStudent, getStudentsByParent, deleteParentStudent } = require('../services/parent_student.service');

async function create(req, res) {
    try {
        const { parent_id, student_id } = req.body;
        const ps = await createParentStudent(parent_id, student_id);
        res.status(201).json(ps);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getByParent(req, res) {
    try {
        const { parent_id } = req.params;
        const ps = await getStudentsByParent(parent_id);
        res.status(200).json(ps);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

async function remove(req, res) {
    try {
        const { id } = req.params;
        const result = await deleteParentStudent(id);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { create, getByParent, remove };