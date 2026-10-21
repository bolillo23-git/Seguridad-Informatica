import express from 'express';
import Publicacion from '../models/Publicacion.js';
import User from '../models/User.js';
import { obtenerHoraNTP } from '../utils/tiempo.js'; 

const router = express.Router();


router.post('/', async (req, res) => {
  try {
    const { contenido, autorId } = req.body;


    const usuarioExiste = await User.findById(autorId);
    if (!usuarioExiste) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    
    const horaOficial = await obtenerHoraNTP();

    
    const nuevaPublicacion = new Publicacion({
      contenido,
      autor: autorId,
      fechaCreacion: horaOficial 
    });

    await nuevaPublicacion.save();

    res.status(201).json({
      mensaje: 'Publicación creada con éxito',
      publicacion: nuevaPublicacion
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear la publicación' });
  }
});


// Ruta PUT para editar una publicación existente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { contenido } = req.body;

    
    const horaOficial = await obtenerHoraNTP();

    const publicacionActualizada = await Publicacion.findByIdAndUpdate(
      id,
      {
        contenido,
        fechaEdicion: horaOficial 
      },
      { new: true }
    );

    if (!publicacionActualizada) {
      return res.status(404).json({ mensaje: 'Publicación no encontrada' });
    }

    res.status(200).json({
      mensaje: 'Publicación editada con éxito',
      publicacion: publicacionActualizada
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al editar la publicación' });
  }
});

// Ruta DELETE para eliminar una publicación
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const publicacionEliminada = await Publicacion.findByIdAndDelete(id);

    if (!publicacionEliminada) {
      return res.status(404).json({ mensaje: 'Publicación no encontrada' });
    }

    res.status(200).json({ mensaje: 'Publicación eliminada correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar la publicación' });
  }
});

// Ruta GET para listar publicaciones
router.get('/', async (req, res) => {
  try {
    const publicaciones = await Publicacion.find()
      // PARCHE DE SEGURIDAD: Solo enviamos el ID, nombre y foto al muro.
      .populate('autor', '_id nombreUsuario fotoPerfil')
      .sort({ fechaCreacion: -1 });

    res.status(200).json(publicaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener las publicaciones' });
  }
});

export default router;