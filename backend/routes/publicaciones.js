import express from 'express';
import Publicacion from '../models/Publicacion.js';
import User from '../models/User.js';

const router = express.Router();

// Ruta POST para crear una publicación
router.post('/', async (req, res) => {
  try {
    const { contenido, autorId } = req.body;

    // Verificamos que el usuario realmente exista antes de dejarlo publicar
    const usuarioExiste = await User.findById(autorId);
    if (!usuarioExiste) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Creamos y guardamos la publicación
    const nuevaPublicacion = new Publicacion({
      contenido,
      autor: autorId
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


// ... código anterior de router.post('/') ...

// Ruta PUT para editar una publicación existente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params; // ID de la publicación en la URL
    const { contenido } = req.body; // El nuevo texto

    // Actualizamos el contenido de la publicación
    const publicacionActualizada = await Publicacion.findByIdAndUpdate(
      id,
      { contenido },
      { new: true } // Devuelve el documento con los cambios ya aplicados
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
    const { id } = req.params; // ID de la publicación en la URL

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

export default router;
