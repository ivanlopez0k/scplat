const express = require('express');
const router = express.Router();
const { create, getAll, getById, update } = require('../controllers/course.controller');

router.post('/', create);
router.get('/', getAll);
router.get('/:id', getById);
router.put('/:id', update);

module.exports = router;