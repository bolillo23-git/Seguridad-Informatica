import express from 'express';
import User from '../models/User.js';
import { verificarToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/solicitar/:idDestino', verificarToken, async (req, res) => {
    try {
        const miId = req.usuario.id;
        const { idDestino } = req.params;

        if (miId === idDestino) return res.status(400).json({ mensaje: 'No puedes enviarte solicitud a ti mismo' });

        const usuarioDestino = await User.findById(idDestino);
        if (!usuarioDestino) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

        if (usuarioDestino.amigos.includes(miId)) return res.status(400).json({ mensaje: 'Ya son amigos' });
        if (usuarioDestino.solicitudes.includes(miId)) return res.status(400).json({ mensaje: 'Ya le enviaste una solicitud' });

        usuarioDestino.solicitudes.push(miId);
        await usuarioDestino.save();

        res.status(200).json({ mensaje: 'Solicitud enviada correctamente' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al enviar solicitud' });
    }
});

router.post('/aceptar/:idSolicitante', verificarToken, async (req, res) => {
    try {
        const miId = req.usuario.id;
        const { idSolicitante } = req.params;

        const yo = await User.findById(miId);
        const solicitante = await User.findById(idSolicitante);

        if (!yo || !solicitante) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

        yo.solicitudes = yo.solicitudes.filter(id => id.toString() !== idSolicitante);
        if (!yo.amigos.includes(idSolicitante)) yo.amigos.push(idSolicitante);
        if (!solicitante.amigos.includes(miId)) solicitante.amigos.push(miId);

        await yo.save();
        await solicitante.save();

        res.status(200).json({ mensaje: '¡Solicitud aceptada! Ahora son amigos.' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al aceptar solicitud' });
    }
});

router.get('/mis-datos', verificarToken, async (req, res) => {
    try {
        const miId = req.usuario.id;
        const usuario = await User.findById(miId)
            .populate('amigos', 'nombreUsuario email')
            .populate('solicitudes', 'nombreUsuario email');

        if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

        res.status(200).json({ amigos: usuario.amigos, solicitudes: usuario.solicitudes });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener datos' });
    }
});

export default router;