const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');
const { loginLimiter } = require('../middlewares/rateLimiter');
const { loginValidation, registerValidation, validateFields } = require('../middlewares/validation');
const userController = require('../controllers/user.controller');
// const {sanitizeFields} = require('../middlewares/sanitize.middleware');

router.post('/register', registerValidation, validateFields, userController.regUser); // solo admin crea usuarios
router.post('/login', loginLimiter, loginValidation, validateFields, userController.login); // pública, no necesita middleware
router.post('/logout', authMiddleware, userController.logout);
router.get('/me', authMiddleware, userController.getCurrentUser);
router.get('/getall', authMiddleware, checkRole('admin'), userController.getAll);
router.get('/by-role/:role', authMiddleware, checkRole('admin'), userController.getByRole);
router.get('/teacher/:id', authMiddleware, checkRole('admin'), userController.getTeacherWithAssignments);
router.post('/assign', authMiddleware, checkRole('admin'), userController.assignTeacherToCourse);
router.delete('/assign/:id', authMiddleware, checkRole('admin'), userController.removeTeacherFromCourse);
module.exports = router