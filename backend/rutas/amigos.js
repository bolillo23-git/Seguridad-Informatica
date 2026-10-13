import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// 1. Enviar solicitud de amistad
router.post('/solicitar/:idDestino', async (req, res) => {
    try {
        const { miId } = req.body; // El ID de quien manda la solicitud
        const { idDestino } = req.params; // El ID de quien la recibe

        if (miId === idDestino) {
            return res.status(400).json({ mensaje: 'No puedes enviarte solicitud a ti mismo' });
        }

        const usuarioDestino = await User.findById(idDestino);
        if (!usuarioDestino) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // Validamos que no sean amigos ya, ni que tenga una solicitud previa
        if (usuarioDestino.amigos.includes(miId)) {
            return res.status(400).json({ mensaje: 'Ya son amigos' });
        }
        if (usuarioDestino.solicitudes.includes(miId)) {
            return res.status(400).json({ mensaje: 'Ya le enviaste una solicitud' });
        }

        // Le guardamos nuestra solicitud al otro usuario
        usuarioDestino.solicitudes.push(miId);
        await usuarioDestino.save();

        res.status(200).json({ mensaje: 'Solicitud enviada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al enviar solicitud' });
    }
});

// 2. Aceptar solicitud
router.post('/aceptar/:idSolicitante', async (req, res) => {
    try {
        const { miId } = req.body; // Mi ID (quien acepta)
        const { idSolicitante } = req.params; // El ID del que me mandó la solicitud

        const yo = await User.findById(miId);
        const solicitante = await User.findById(idSolicitante);

        if (!yo || !solicitante) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // Quitamos la solicitud de mi lista de pendientes
        yo.solicitudes = yo.solicitudes.filter(id => id.toString() !== idSolicitante);

        // Nos agregamos mutuamente como amigos
        if (!yo.amigos.includes(idSolicitante)) yo.amigos.push(idSolicitante);
        if (!solicitante.amigos.includes(miId)) solicitante.amigos.push(miId);

        await yo.save();
        await solicitante.save();

        res.status(200).json({ mensaje: '¡Solicitud aceptada! Ahora son amigos.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al aceptar solicitud' });
    }
});

// 3. Obtener mis amigos y mis solicitudes pendientes
router.get('/mis-datos/:miId', async (req, res) => {
    try {
        const { miId } = req.params;
        // .populate() cambia los IDs feos por el nombre de la persona automáticamente
        const usuario = await User.findById(miId)
            .populate('amigos', 'nombreUsuario email')
            .populate('solicitudes', 'nombreUsuario email');

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        res.status(200).json({
            amigos: usuario.amigos,
            solicitudes: usuario.solicitudes
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener datos' });
    }
});

export default router;