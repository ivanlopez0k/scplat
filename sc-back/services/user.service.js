const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { User } = require('../models')

async function register(name, lastname, dni, email, password, role) {
    const hashedPassword = await bcrypt.hash(password, 10);

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

module.exports = {register}