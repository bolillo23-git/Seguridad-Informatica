import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Publicacion from '../models/Publicacion.js';

const router = express.Router();

// --- NUEVAS RUTAS PARA EL DISEÑO DEL PERFIL ---

// 1. Obtener la información del perfil (sin la contraseña)
router.get('/:id', async (req, res) => {
  try {
      const usuario = await User.findById(req.params.id).select('-password');
      if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      
      res.status(200).json(usuario);
  } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: 'Error al obtener perfil' });
  }
});

// 2. Obtener solo las publicaciones de este usuario
router.get('/:id/publicaciones', async (req, res) => {
  try {
      // Usamos "autor" porque así lo tienes definido en tu base de datos
      const publicaciones = await Publicacion.find({ autor: req.params.id })
          .sort({ fechaCreacion: -1 }); // -1 para que salgan las más nuevas primero
          
      res.status(200).json(publicaciones);
  } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: 'Error al obtener publicaciones' });
  }
});

// 3. Cambiar solo la foto de perfil
router.put('/:id/foto', async (req, res) => {
  try {
      const { fotoBase64 } = req.body;
      const usuario = await User.findByIdAndUpdate(
          req.params.id, 
          { fotoPerfil: fotoBase64 }, 
          { new: true }
      );
      res.status(200).json({ mensaje: 'Foto actualizada exitosamente', fotoPerfil: usuario.fotoPerfil });
  } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: 'Error al actualizar la foto' });
  }
});

// 4. Cambiar foto de portada
router.put('/:id/portada', async (req, res) => {
  try {
    const { fotoBase64 } = req.body;
    const usuario = await User.findByIdAndUpdate(
      req.params.id,
      { fotoPortada: fotoBase64 },
      { new: true }
    );
    res.status(200).json({ mensaje: 'Portada actualizada', fotoPortada: usuario.fotoPortada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar la portada' });
  }
});


// --- TUS RUTAS ORIGINALES (EDITAR Y ELIMINAR CUENTA) ---

// Ruta PUT para actualizar el perfil (nombre y contraseña)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params; 
    const { nombreUsuario, password } = req.body; 

    let camposAActualizar = {};
    
    if (nombreUsuario) {
      camposAActualizar.nombreUsuario = nombreUsuario;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      camposAActualizar.password = await bcrypt.hash(password, salt);
    }

    const usuarioActualizado = await User.findByIdAndUpdate(
      id,
      camposAActualizar,
      { new: true } 
    ).select('-password'); 

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
    const { id } = req.params; 

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