import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Publicacion from '../models/Publicacion.js';

const router = express.Router();

// Ruta PUT para actualizar el perfil (requiere el ID en la URL)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params; // Capturamos el ID directamente desde la URL
    const { nombreUsuario, password } = req.body; // Los nuevos datos a guardar

    // Preparamos un objeto solo con los datos que el usuario realmente envió
    let camposAActualizar = {};
    
    if (nombreUsuario) {
      camposAActualizar.nombreUsuario = nombreUsuario;
    }

    if (password) {
      // Si decide cambiar su contraseña, debemos hashear la nueva
      const salt = await bcrypt.genSalt(10);
      camposAActualizar.password = await bcrypt.hash(password, salt);
    }

    // Buscamos al usuario por su ID y lo actualizamos
    const usuarioActualizado = await User.findByIdAndUpdate(
      id,
      camposAActualizar,
      { new: true } // Esta opción obliga a Mongoose a devolvernos el documento ya actualizado
    ).select('-password'); // Ocultamos la contraseña en la respuesta por seguridad

    if (!usuarioActualizado) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.status(200).json({
      mensaje: 'Perfil actualizado con éxito',
      usuario: usuarioActualizado
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar el perfil' });
  }
});

// Ruta DELETE para eliminar una cuenta de usuario
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params; // ID del usuario en la URL

    // 1. Buscamos y eliminamos al usuario
    const usuarioEliminado = await User.findByIdAndDelete(id);

    if (!usuarioEliminado) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // 2. Eliminamos en cascada todas las publicaciones que le pertenecían a este usuario
    await Publicacion.deleteMany({ autor: id });

    res.status(200).json({ 
      mensaje: 'Cuenta y publicaciones eliminadas correctamente' 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar la cuenta' });
  }
});



export default router;