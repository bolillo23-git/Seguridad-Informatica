import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { obtenerHoraNTP } from '../utils/tiempo.js'; 

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ mensaje: 'Credenciales inválidas' });
    }

    const contrasenaValida = await bcrypt.compare(password, usuario.password);

    if (!contrasenaValida) {
      return res.status(400).json({ mensaje: 'Credenciales inválidas' });
    }

  
    const horaOficial = await obtenerHoraNTP();

    
    usuario.ultimoLogin = horaOficial;
    await usuario.save();

    res.status(200).json({
      mensaje: '¡Login exitoso, hermano!',
      usuario: {
        id: usuario._id,
        email: usuario.email,
        nombreUsuario: usuario.nombreUsuario,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

export default router;