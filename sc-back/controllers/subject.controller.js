const { createSubject, getSubjects, getSubjectById, updateSubject } = require('../services/subject.service');

async function create(req, res) {
    try {
        const { name } = req.body;
        const subject = await createSubject(name);
        res.status(201).json(subject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getAll(req, res) {
    try {
        const subjects = await getSubjects();
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getById(req, res) {
    try {
        const { id } = req.params;
        const subject = await getSubjectById(id);
        res.status(200).json(subject);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

async function update(req, res) {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const subject = await updateSubject(id, name);
        res.status(200).json(subject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { create, getAll, getById, update };