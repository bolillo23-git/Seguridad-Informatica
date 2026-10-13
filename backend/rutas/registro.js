import express from 'express';
import bcrypt from 'bcryptjs'; 
import User from '../models/User.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email, password, nombreUsuario } = req.body;

    let usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'Este correo ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHasheada = await bcrypt.hash(password, salt);
        
    const nuevoUsuario = new User({
      email,
      password: passwordHasheada, 
      nombreUsuario
    });

    await nuevoUsuario.save();

    res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

export default router;