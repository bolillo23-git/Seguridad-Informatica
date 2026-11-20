import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
    // Se espera que el cliente envíe el token en los headers: Authorization: Bearer <token>
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ mensaje: 'Acceso denegado: Se requiere un token' });
    }

    try {
        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = verificado; // Guardamos { id, rol } en req.usuario para usarlo en las rutas
        next();
    } catch (error) {
        res.status(401).json({ mensaje: 'Token no válido o expirado' });
    }
};