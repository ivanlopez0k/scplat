const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
// const {sanitizeFields} = require('../middlewares/sanitize.middleware');

router.post('/register', userController.regUser);

module.exports = router