import express from 'express';
import User from '../../models/User.js';
import { verificarToken } from '../../middlewares/auth.js';
import { verificarRol } from '../../middlewares/roles.js';

const router = express.Router();

router.put('/:id', verificarToken, verificarRol(['admin', 'moderador']), async (req, res) => {
  try {
    const { nuevoEstado } = req.body;
    if (!['activo', 'suspendido', 'bloqueado'].includes(nuevoEstado)) return res.status(400).json({ mensaje: 'Estado no válido' });

    const usuarioSancionado = await User.findByIdAndUpdate(req.params.id, { estado: nuevoEstado }, { new: true }).select('-password');
    if (!usuarioSancionado) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    res.status(200).json({ mensaje: `Usuario cambiado a estado: ${nuevoEstado}`, usuario: usuarioSancionado });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al aplicar sanción' });
  }
});

export default router;