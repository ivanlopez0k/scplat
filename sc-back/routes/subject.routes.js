const express = require('express');
const router = express.Router();
const { create, getAll, getById, update } = require('../controllers/subject.controller');

router.post('/create', create);
router.get('/getall', getAll);
router.get('/:id', getById);
router.put('/:id', update);

module.exports = router;