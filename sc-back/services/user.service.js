const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { User } = require('../models');

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


module.exports = {register, login, getUsers, getUsersByRole}