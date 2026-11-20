import express from 'express';
import Mensaje from '../models/Mensaje.js';
import { obtenerHoraNTP } from '../utils/tiempo.js';
import { verificarToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', verificarToken, async (req, res) => {
    try {
        const { destinatario, contenido } = req.body;
        const remitente = req.usuario.id;

        if (!contenido || contenido.trim() === '') return res.status(400).json({ mensaje: 'El mensaje no puede estar vacío' });

        const horaOficial = await obtenerHoraNTP();
        const nuevoMensaje = new Mensaje({ remitente, destinatario, contenido, fechaEnvio: horaOficial });
        await nuevoMensaje.save();

        res.status(201).json(nuevoMensaje);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al enviar el mensaje' });
    }
});

router.get('/:idOtroUsuario', verificarToken, async (req, res) => {
    try {
        const miId = req.usuario.id;
        const { idOtroUsuario } = req.params;

        const historial = await Mensaje.find({
            $or: [
                { remitente: miId, destinatario: idOtroUsuario },
                { remitente: idOtroUsuario, destinatario: miId }
            ]
        }).sort({ fechaEnvio: 1 });

        res.status(200).json(historial);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al cargar el chat' });
    }
});

export default router;