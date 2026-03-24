function checkRole(...roles) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ message: 'No autenticado' });
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'No tenés permisos para esto' });
        }
        next();
    }
}

module.exports = checkRole;