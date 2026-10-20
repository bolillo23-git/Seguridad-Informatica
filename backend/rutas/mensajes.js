import express from 'express';
import Mensaje from '../models/Mensaje.js';
import { obtenerHoraNTP } from '../utils/tiempo.js';

const router = express.Router();

// 1. Enviar un mensaje nuevo
router.post('/', async (req, res) => {
    try {
        const { remitente, destinatario, contenido } = req.body;

        if (!contenido || contenido.trim() === '') {
            return res.status(400).json({ mensaje: 'El mensaje no puede estar vacío' });
        }
        

        const nuevoMensaje = new Mensaje({ remitente, destinatario, contenido });
        await nuevoMensaje.save();

        res.status(201).json(nuevoMensaje);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al enviar el mensaje' });
    }
});

// 2. Obtener el historial de chat entre dos usuarios
router.get('/:usuario1/:usuario2', async (req, res) => {
    try {
        const { usuario1, usuario2 } = req.params;

        // Buscamos mensajes donde:
        // (remitente = u1 Y destinatario = u2) Ó (remitente = u2 Y destinatario = u1)
        const historial = await Mensaje.find({
            $or: [
                { remitente: usuario1, destinatario: usuario2 },
                { remitente: usuario2, destinatario: usuario1 }
            ]
        }).sort({ fechaEnvio: 1 }); // El 1 los ordena del más antiguo al más nuevo (como en WhatsApp)

        res.status(200).json(historial);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al cargar el chat' });
    }
});

export default router;