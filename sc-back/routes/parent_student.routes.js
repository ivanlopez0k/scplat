const express = require('express');
const router = express.Router();
const { create, getByParent, remove } = require('../controllers/parent_student.controller');

router.post('/', create);
router.get('/:parent_id', getByParent);
router.delete('/:id', remove);

module.exports = router;