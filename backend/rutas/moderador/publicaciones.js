import express from 'express';
import Publicacion from '../../models/Publicacion.js'; // Salimos de la carpeta con ../../

const router = express.Router();

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const publicacionEliminada = await Publicacion.findByIdAndDelete(id);

    if (!publicacionEliminada) {
      return res.status(404).json({ mensaje: 'Publicación no encontrada' });
    }

    res.status(200).json({ mensaje: 'Publicación eliminada por el moderador' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar la publicación' });
  }
});

export default router;