import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Publicacion from '../models/Publicacion.js';
import { registrarLog } from '../utils/logger.js'; // 1. Importamos el logger centralizado
import { verificarToken } from '../middlewares/auth.js';

const router = express.Router();

router.get('/:id', verificarToken, async (req, res) => {
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
router.get('/:id/publicaciones', verificarToken, async (req, res) => {
  try {
    const publicaciones = await Publicacion.find({ autor: req.params.id })
      .sort({ fechaCreacion: -1 });

    res.status(200).json(publicaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener publicaciones' });
  }
});

// 3. Cambiar solo la foto de perfil
router.put('/:id/foto', verificarToken, async (req, res) => {
  if (req.params.id !== req.usuario.id) {
    return res.status(403).json({ mensaje: 'No puedes editar la foto de un perfil ajeno' });
  }

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
router.put('/:id/portada', verificarToken, async (req, res) => {
  if (req.params.id !== req.usuario.id) {
    return res.status(403).json({ mensaje: 'No puedes editar la portada de un perfil ajeno' });
  }

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


router.put('/:id', verificarToken, async (req, res) => {
  if (req.params.id !== req.usuario.id) {
    return res.status(403).json({ mensaje: 'No puedes editar la información de un perfil ajeno' });
  }

  try {
    const { id } = req.params;
    const { nombreUsuario, password } = req.body;

    let camposAActualizar = {};
    let seCambioContrasena = false;

    if (nombreUsuario) {
      camposAActualizar.nombreUsuario = nombreUsuario;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      camposAActualizar.password = await bcrypt.hash(password, salt);
      seCambioContrasena = true;
    }

    const usuarioActualizado = await User.findByIdAndUpdate(
      id,
      camposAActualizar,
      { new: true }
    ).select('-password');

    if (!usuarioActualizado) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // 5. LOG CENTRALIZADO (Contraseña)
    if (seCambioContrasena) {
      await registrarLog('CONTRASENA_ACTUALIZADA', 'El usuario actualizó su contraseña', req, id);
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

// Ruta DELETE 
router.delete('/:id', verificarToken, async (req, res) => {
  if (req.params.id !== req.usuario.id) {
    return res.status(403).json({ mensaje: 'No puedes eliminar una cuenta que no te pertenece' });
  }

  try {
    const { id } = req.params;

    const usuarioEliminado = await User.findByIdAndDelete(id);

    if (!usuarioEliminado) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    await Publicacion.deleteMany({ autor: id });

    // 6. LOG CENTRALIZADO (Cuenta eliminada)
    await registrarLog('CUENTA_ELIMINADA', `El usuario ${usuarioEliminado.email} eliminó su cuenta definitivamente junto con sus publicaciones`, req);

    res.status(200).json({
      mensaje: 'Cuenta y publicaciones eliminadas correctamente'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar la cuenta' });
  }
});

export default router;