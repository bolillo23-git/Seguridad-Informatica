import express from 'express';
import User from '../models/User.js';
import { verificarToken } from '../middlewares/auth.js'; // 1. Importamos el middleware

const router = express.Router();

// 2. Protegemos la ruta inyectando verificarToken
router.get('/buscar', verificarToken, async (req, res) => {
    try {
        const { nombre } = req.query;

        if (!nombre) {
            return res.status(200).json([]);
        }

        // Buscamos a cualquiera que tenga ese texto en su nombre (ignorando mayúsculas/minúsculas)
        const usuarios = await User.find({
            nombreUsuario: { $regex: nombre, $options: 'i' }
        }).select('_id nombreUsuario'); // Solo mandamos ID y nombre por privacidad, no enviamos correos ni roles

        res.status(200).json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al buscar personas' });
    }
});

export default router;