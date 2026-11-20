import express from 'express';
import Publicacion from '../models/Publicacion.js';
import { obtenerHoraNTP } from '../utils/tiempo.js';
import { verificarToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', verificarToken, async (req, res) => {
  try {
    const { contenido } = req.body;
    const autorId = req.usuario.id;
    const horaOficial = await obtenerHoraNTP();

    const nuevaPublicacion = new Publicacion({ contenido, autor: autorId, fechaCreacion: horaOficial });
    await nuevaPublicacion.save();

    res.status(201).json({ mensaje: 'Publicación creada con éxito', publicacion: nuevaPublicacion });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear la publicación' });
  }
});

router.put('/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { contenido } = req.body;

    const publicacion = await Publicacion.findById(id);
    if (!publicacion) return res.status(404).json({ mensaje: 'Publicación no encontrada' });

    if (publicacion.autor.toString() !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tienes permiso para editar esta publicación' });
    }

    publicacion.contenido = contenido;
    publicacion.fechaEdicion = await obtenerHoraNTP();
    await publicacion.save();

    res.status(200).json({ mensaje: 'Publicación editada con éxito', publicacion });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al editar la publicación' });
  }
});

router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const publicacion = await Publicacion.findById(id);

    if (!publicacion) return res.status(404).json({ mensaje: 'Publicación no encontrada' });

    if (publicacion.autor.toString() !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tienes permiso para eliminar esta publicación' });
    }

    await Publicacion.findByIdAndDelete(id);
    res.status(200).json({ mensaje: 'Publicación eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar la publicación' });
  }
});

router.get('/', verificarToken, async (req, res) => {
  try {
    const publicaciones = await Publicacion.find()
      .populate('autor', '_id nombreUsuario fotoPerfil')
      .sort({ fechaCreacion: -1 });
    res.status(200).json(publicaciones);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las publicaciones' });
  }
});

export default router;