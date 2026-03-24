const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

    try {
        const decoded = jwt.verify(token, process.env.JWTSECRET);
        req.user = decoded; // guardamos el usuario decodificado en req.user
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido' });
    }
}

module.exports = authMiddleware;