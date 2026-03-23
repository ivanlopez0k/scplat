const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
// const {sanitizeFields} = require('../middlewares/sanitize.middleware');

router.post('/register', userController.regUser);
router.post('/login', userController.login);
router.get('/getall', userController.getAll)

module.exports = router