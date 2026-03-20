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

module.exports = { regUser }