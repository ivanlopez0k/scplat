const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const { User, Tc, Cs, Course, Subject, Enrollment, Ps } = require('../models');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('./email.service');

async function register(name, lastname, dni, email, password, role, courseId, childDni, parentId) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const exUser = await User.findOne({ where: { email: email } });

    if(exUser){
        throw new Error('This email is already used')
    }

    const user = await User.create({
        name,
        lastname,
        dni,
        email,
        password: hashedPassword,
        role
    });

    // Auto-enroll student in selected course
    if (role === 'student' && courseId) {
        const course = await Course.findByPk(courseId);
        if (!course) {
            throw new Error('Curso no encontrado');
        }

        const currentYear = new Date().getFullYear();

        const existing = await Enrollment.findOne({
            where: { student_id: user.id, course_id: courseId, school_year: currentYear }
        });
        if (!existing) {
            await Enrollment.create({
                student_id: user.id,
                course_id: courseId,
                school_year: currentYear
            });
        }
    }

    // Auto-link parent to student by DNI (when parent registers themselves)
    if (role === 'parent' && childDni) {
        const student = await User.findOne({
            where: { dni: childDni, role: 'student' }
        });
        if (student) {
            const existingLink = await Ps.findOne({
                where: { parent_id: user.id, student_id: student.id }
            });
            if (!existingLink) {
                await Ps.create({
                    parent_id: user.id,
                    student_id: student.id
                });
            }
        }
    }

    // Auto-link student to parent (when parent registers a child)
    if (role === 'student' && parentId) {
        const parent = await User.findByPk(parentId);
        if (parent && parent.role === 'parent') {
            const existingLink = await Ps.findOne({
                where: { parent_id: parentId, student_id: user.id }
            });
            if (!existingLink) {
                await Ps.create({
                    parent_id: parentId,
                    student_id: user.id
                });
            }
        }
    }

    // Send welcome email (non-blocking, don't fail registration if email fails)
    try {
        await sendWelcomeEmail(email, name, role);
    } catch (emailError) {
        console.error(`[WELCOME] Email failed for ${email}:`, emailError.message);
    }

    return user;
}

async function login(email, password){
    const user = await User.findOne({where:{email: email}});

    if(!user){
        throw new Error('User not found')
    };
    const encryptedPass = await bcrypt.compare(password, user.password);

    if(!encryptedPass){
        throw new Error('Incorrect Password')
    };

    const token = jwt.sign({
        id:user.id, name: user.name, lastname: user.lastname, dni: user.dni, email: user.email, role: user.role
    }, process.env.JWTSECRET, {expiresIn: '8h'})
    return token
}

async function getUsers() {
    const user = await User.findAll();
    return user;
}

async function getUsersByRole(role) {
    const users = await User.findAll({
        where: { role },
        attributes: ['id', 'name', 'lastname', 'dni', 'email', 'role']
    });
    return users;
}

async function getTeacherWithAssignments(teacherId) {
    const teacher = await User.findByPk(teacherId, {
        attributes: ['id', 'name', 'lastname', 'dni', 'email', 'role'],
        include: [{
            model: Tc,
            as: 'teacher_courses',
            include: [{
                model: Cs,
                as: 'cs',
                include: [
                    { model: Course, as: 'course', attributes: ['id', 'name', 'year'] },
                    { model: Subject, as: 'subject', attributes: ['id', 'name'] }
                ]
            }]
        }]
    });

    if (!teacher) {
        throw new Error('Profesor no encontrado');
    }

    return teacher;
}

async function assignTeacherToCourse(teacher_id, cs_id) {
    // verificamos que el usuario exista y sea profesor
    const teacher = await User.findByPk(teacher_id);
    if (!teacher) throw new Error('Usuario no encontrado');
    if (teacher.role !== 'teacher') throw new Error('El usuario no es un profesor');

    // verificamos que el course_subject exista
    const cs = await Cs.findByPk(cs_id);
    if (!cs) throw new Error('CourseSubject no encontrado');

    // verificamos que no exista ya esa combinación
    const existing = await Tc.findOne({ where: { teacher_id, cs_id } });
    if (existing) throw new Error('Ese profesor ya está asignado a ese curso/materia');

    const tc = await Tc.create({ teacher_id, cs_id });
    return tc;
}

async function removeTeacherFromCourse(tcId) {
    const tc = await Tc.findByPk(tcId);
    if (!tc) throw new Error('Asignación no encontrada');
    await tc.destroy();
    return { message: 'Asignación eliminada correctamente' };
}

async function findStudentByDni(dni) {
    const student = await User.findOne({
        where: { dni, role: 'student' },
        attributes: ['id', 'name', 'lastname', 'dni', 'email', 'role']
    });
    if (!student) {
        throw new Error('Estudiante no encontrado');
    }
    return student;
}

// Password reset functions
function generateResetToken() {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
}

async function requestPasswordReset(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
        // Don't reveal if email exists or not
        return { message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña' };
    }

    const resetToken = generateResetToken();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.update({
        reset_token: resetToken,
        reset_token_expires: expires
    });

    // Send email with reset link
    try {
        await sendPasswordResetEmail(email, resetToken, user.name);
    } catch (emailError) {
        console.error(`[PASSWORD RESET] Email failed for ${email}:`, emailError.message);
        // Log token for manual recovery if email fails
        console.log(`[PASSWORD RESET] Token for ${email}: ${resetToken}`);
    }

    return {
        message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña',
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : null
    };
}

async function validateResetToken(token) {
    const user = await User.findOne({
        where: {
            reset_token: token,
            reset_token_expires: {
                [Op.gt]: new Date()
            }
        }
    });

    if (!user) {
        throw new Error('Token inválido o expirado');
    }

    return user;
}

async function resetPassword(token, newPassword) {
    const user = await validateResetToken(token);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await user.update({
        password: hashedPassword,
        reset_token: null,
        reset_token_expires: null
    });

    return { message: 'Contraseña actualizada correctamente' };
}

module.exports = {
    register,
    login,
    getUsers,
    getUsersByRole,
    getTeacherWithAssignments,
    assignTeacherToCourse,
    removeTeacherFromCourse,
    findStudentByDni,
    requestPasswordReset,
    validateResetToken,
    resetPassword
}