const express = require('express');
const router = express.Router();
const { create, getAll, getById, remove } = require('../controllers/teacher_courses.controller');

router.post('/', create);
router.get('/', getAll);
router.get('/:id', getById);
router.delete('/:id', remove);

module.exports = router;