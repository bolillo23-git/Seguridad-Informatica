import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { obtenerHoraNTP } from '../utils/tiempo.js';
import Log from '../models/Log.js'; // 1. Importamos el modelo de Logs

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email, password, nombreUsuario } = req.body;

   
    const ipUsuario = req.ip || req.socket.remoteAddress;

    let usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'Este correo ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHasheada = await bcrypt.hash(password, salt);

    const horaOficial = await obtenerHoraNTP();

    const nuevoUsuario = new User({
      email,
      password: passwordHasheada,
      nombreUsuario,
      fechaCreacion: horaOficial
    });

    await nuevoUsuario.save();

  
    await new Log({
      accion: 'NUEVO_REGISTRO',
      usuario: nuevoUsuario._id,
      detalles: `Se registró un nuevo usuario con correo: ${email}`,
      ip: ipUsuario,
      fechaHora: horaOficial
    }).save();

    res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

export default router;