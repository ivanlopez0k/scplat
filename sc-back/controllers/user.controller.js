const userService = require('../services/user.service');

async function regUser(req, res){
    const { name, lastname, dni, email, password, role, courseId, childDni } = req.body;
    try{
        const user = await userService.register(name, lastname, dni, email, password, role, courseId, childDni)
        res.status(200).send(user)
    }
    catch (error){
        res.status(400).json({ message: 'Error al registrar usuario' })
        console.error('Register error:', error.message);
    }
}

async function login(req, res){
    const { email, password } = req.body;

    try{
        const token = await userService.login(email,password)

        // Set token in httpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.ENVIRONMENT === 'production',
            sameSite: 'strict',
            maxAge: 8 * 60 * 60 * 1000, // 8 hours
            path: '/'
        });

        res.status(200).json({ message: 'Bienvenido' })
    }catch(error){
        // Generic error message to prevent user enumeration
        res.status(401).json({ message: 'Credenciales inválidas' })
        console.error('Login error:', error.message);
    }
}

async function logout(req, res){
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.ENVIRONMENT === 'production',
        sameSite: 'strict',
        path: '/'
    });
    res.status(200).json({ message: 'Sesión cerrada' });
}

async function getCurrentUser(req, res){
    // req.user is set by authMiddleware from the token
    if (!req.user) {
        return res.status(401).json({ message: 'No autenticado' });
    }

    // Return user info without sensitive data
    res.json({
        id: req.user.id,
        name: req.user.name,
        lastname: req.user.lastname,
        email: req.user.email,
        role: req.user.role
    });
}

async function getAll(req, res){
    try {
        const user = await userService.getUsers();
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

async function getByRole(req, res){
    try {
        const { role } = req.params;
        const users = await userService.getUsersByRole(role);
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

async function getTeacherWithAssignments(req, res){
    try {
        const { id } = req.params;
        const teacher = await userService.getTeacherWithAssignments(id);
        res.status(200).json(teacher);
    } catch (err) {
        res.status(404).json({message: err.message});
    }
}

async function assignTeacherToCourse(req, res){
    try {
        const { teacher_id, cs_id } = req.body;
        const result = await userService.assignTeacherToCourse(teacher_id, cs_id);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({message: err.message});
    }
}

async function removeTeacherFromCourse(req, res){
    try {
        const { id } = req.params;
        const result = await userService.removeTeacherFromCourse(id);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

async function findStudentByDni(req, res){
    try {
        const { dni } = req.params;
        const student = await userService.findStudentByDni(dni);
        res.status(200).json(student);
    } catch (err) {
        res.status(404).json({message: err.message});
    }
}

async function getMyAssignments(req, res){
    try {
        if (!req.user || req.user.role !== 'teacher') {
            return res.status(403).json({message: 'No autorizado'});
        }
        const teacher = await userService.getTeacherWithAssignments(req.user.id);
        res.status(200).json(teacher);
    } catch (err) {
        res.status(404).json({message: err.message});
    }
}

async function requestPasswordReset(req, res){
    const { email } = req.body;
    try {
        const result = await userService.requestPasswordReset(email);
        res.status(200).json(result);
    } catch (err) {
        // Don't reveal if email exists
        res.status(200).json({ message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña' });
    }
}

async function resetPassword(req, res){
    const { token, password } = req.body;
    try {
        const result = await userService.resetPassword(token, password);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function verifyResetToken(req, res){
    const { token } = req.params;
    try {
        await userService.validateResetToken(token);
        res.status(200).json({ valid: true });
    } catch (err) {
        res.status(400).json({ valid: false, message: err.message });
    }
}

module.exports = {
    regUser,
    login,
    logout,
    getCurrentUser,
    getAll,
    getByRole,
    getTeacherWithAssignments,
    assignTeacherToCourse,
    removeTeacherFromCourse,
    findStudentByDni,
    getMyAssignments,
    requestPasswordReset,
    resetPassword,
    verifyResetToken
}