import express from 'express';
import User from '../../models/User.js';
import { verificarToken } from '../../middlewares/auth.js';
import { verificarRol } from '../../middlewares/roles.js';

const router = express.Router();

router.get('/buscar', verificarToken, verificarRol(['admin']), async (req, res) => {
  try {
    const { correo } = req.query;
    const query = correo ? { email: { $regex: correo, $options: 'i' } } : {};
    const usuarios = await User.find(query).select('-password');
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al buscar' });
  }
});

router.put('/:id', verificarToken, verificarRol(['admin']), async (req, res) => {
  try {
    const { nuevoRol } = req.body;
    if (!['usuario', 'moderador', 'admin'].includes(nuevoRol)) return res.status(400).json({ mensaje: 'Rol no válido' });

    const usuarioActualizado = await User.findByIdAndUpdate(req.params.id, { rol: nuevoRol }, { new: true }).select('-password');
    if (!usuarioActualizado) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    res.status(200).json({ mensaje: `Rol actualizado a: ${nuevoRol}`, usuario: usuarioActualizado });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cambiar el rol' });
  }
});

router.get('/usuarios', verificarToken, verificarRol(['admin']), async (req, res) => {
  try {
    const usuarios = await User.find().select('-password');
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios' });
  }
});

export default router;