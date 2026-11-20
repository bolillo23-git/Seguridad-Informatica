import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { obtenerHoraNTP } from '../utils/tiempo.js';
import { registrarLog } from '../utils/logger.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;
    const horaOficial = await obtenerHoraNTP();

    const usuario = await User.findOne({ email });

    if (!usuario) {
      await registrarLog('LOGIN_FALLIDO', `Intento con correo inexistente: ${email}`, req);
      return res.status(400).json({ mensaje: 'Credenciales inválidas' });
    }

    // Mantenemos esto por si un MODERADOR o ADMIN bloquea la cuenta manualmente
    if (usuario.estado === 'bloqueado' || usuario.estado === 'suspendido') {
      await registrarLog('LOGIN_RECHAZADO', 'Intento de acceso a una cuenta bloqueada o suspendida', req, usuario._id);
      return res.status(403).json({ mensaje: 'Tu cuenta ha sido bloqueada. Contacta al administrador.' });
    }

    const contrasenaValida = await bcrypt.compare(password, usuario.password);
    if (!contrasenaValida) {
      await registrarLog('LOGIN_FALLIDO', 'Contraseña incorrecta', req, usuario._id);
      return res.status(400).json({ mensaje: 'Credenciales inválidas' });
    }

    usuario.ultimoLogin = horaOficial;
    await usuario.save();

    await registrarLog('LOGIN_EXITOSO', 'Inicio de sesión exitoso', req, usuario._id);

    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      mensaje: '¡Login exitoso, hermano!',
      token,
      usuario: { id: usuario._id, email: usuario.email, nombreUsuario: usuario.nombreUsuario, rol: usuario.rol }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

export default router;