import express from 'express';
import Publicacion from '../../models/Publicacion.js';
import { verificarToken } from '../../middlewares/auth.js';
import { verificarRol } from '../../middlewares/roles.js';

const router = express.Router();

router.delete('/:id', verificarToken, verificarRol(['admin', 'moderador']), async (req, res) => {
  try {
    const publicacionEliminada = await Publicacion.findByIdAndDelete(req.params.id);
    if (!publicacionEliminada) return res.status(404).json({ mensaje: 'Publicación no encontrada' });

    res.status(200).json({ mensaje: 'Publicación eliminada por el moderador' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar la publicación' });
  }
});

export default router;