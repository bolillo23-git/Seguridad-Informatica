import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { obtenerHoraNTP } from '../utils/tiempo.js';
import Log from '../models/Log.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;

    
    const horaOficial = await obtenerHoraNTP();
    const ipUsuario = req.ip || req.socket.remoteAddress;

    const usuario = await User.findOne({ email });

    if (!usuario) {
     
      await new Log({
        accion: 'LOGIN_FALLIDO',
        detalles: `Intento de acceso con correo inexistente: ${email}`,
        ip: ipUsuario,
        fechaHora: horaOficial
      }).save();

      return res.status(400).json({ mensaje: 'Credenciales inválidas' });
    }

    const contrasenaValida = await bcrypt.compare(password, usuario.password);

    if (!contrasenaValida) {
      
      await new Log({
        accion: 'LOGIN_FALLIDO',
        usuario: usuario._id,
        detalles: 'Contraseña incorrecta',
        ip: ipUsuario,
        fechaHora: horaOficial
      }).save();

      return res.status(400).json({ mensaje: 'Credenciales inválidas' });
    }

    
    usuario.ultimoLogin = horaOficial;
    await usuario.save();

   
    await new Log({
      accion: 'LOGIN_EXITOSO',
      usuario: usuario._id,
      detalles: 'El usuario inició sesión correctamente',
      ip: ipUsuario,
      fechaHora: horaOficial
    }).save();

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