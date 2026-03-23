const express = require('express');
const router = express.Router();
const { create, getAll, getById, getByStudent, update } = require('../controllers/grade.controller');

router.post('/', create);
router.get('/', getAll);
router.get('/:id', getById);
router.get('/student/:student_id', getByStudent); // para que el alumno/padre vea las notas
router.put('/:id', update);

module.exports = router;