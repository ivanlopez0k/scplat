const userService = require('../services/user.service');

async function regUser(req, res){
    const { name, lastname, dni, email, password, role } = req.body;
    try{
        const user = await userService.register(name,lastname,dni,email,password,role)
        res.status(200).send(user)
    }
    catch (error){
        res.status(400).json('failed')
        console.log(error)
    }
}

async function login(req, res){
    const { email, password } = req.body;

    try{
        const login = await userService.login(email,password)
        res.status(200).send('Bienvenido', login)
    }catch(error){
        res.status(400).json('User not found')
        console.log(error);
    }
}

async function getAll(req, res){
    try {
        const user = await userService.getUsers();
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

module.exports = { regUser, login, getAll }