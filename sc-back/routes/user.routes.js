const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');
const userController = require('../controllers/user.controller');
// const {sanitizeFields} = require('../middlewares/sanitize.middleware');

router.post('/register', authMiddleware, checkRole('admin'), regUser); // solo admin crea usuarios
router.post('/login', login); // pública, no necesita middleware
router.get('/getall', authMiddleware, checkRole('admin'), getAll);
module.exports = router