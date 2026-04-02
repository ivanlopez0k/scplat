const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const { User, Tc, Cs, Course, Subject } = require('../models');

async function register(name, lastname, dni, email, password, role) {
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


module.exports = {register, login, getUsers, getUsersByRole, getTeacherWithAssignments, assignTeacherToCourse, removeTeacherFromCourse}