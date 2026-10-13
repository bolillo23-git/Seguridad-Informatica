import express from 'express';
import User from '../../models/User.js';

const router = express.Router();


// Ruta GET para buscar usuarios por correo
router.get('/buscar', async (req, res) => {
  try {
    const { correo } = req.query; // Leemos lo que llegue en ?correo=...

    // Si la barra de búsqueda está vacía, devolvemos todos
    if (!correo) {
      const usuarios = await User.find().select('-password');
      return res.status(200).json(usuarios);
    }

    // Buscamos correos que contengan el texto, ignorando mayúsculas/minúsculas
    const usuariosEncontrados = await User.find({
      email: { $regex: correo, $options: 'i' }
    }).select('-password');

    res.status(200).json(usuariosEncontrados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al buscar en la base de datos' });
  }
});

// Ruta PUT para que un Admin le cambie el rol a otro usuario
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params; // ID de la persona a la que le cambiaremos el rol
    const { nuevoRol } = req.body; 

    if (!['usuario', 'moderador', 'admin'].includes(nuevoRol)) {
      return res.status(400).json({ mensaje: 'Rol no válido' });
    }

    const usuarioActualizado = await User.findByIdAndUpdate(
      id,
      { rol: nuevoRol },
      { new: true }
    ).select('-password');

    if (!usuarioActualizado) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.status(200).json({
      mensaje: `Rol actualizado exitosamente a: ${nuevoRol}`,
      usuario: usuarioActualizado
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al cambiar el rol' });
  }
});

// Ruta GET para obtener la lista de todos los usuarios
router.get('/usuarios', async (req, res) => {
  try {
    // Buscamos a todos los usuarios, pero sin enviar sus contraseñas
    const usuarios = await User.find().select('-password');
    res.status(200).json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener usuarios' });
  }
});

export default router;