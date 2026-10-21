import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Publicacion from '../models/Publicacion.js';
import { obtenerHoraNTP } from '../utils/tiempo.js'; // 1. Importamos utilidad NTP
import Log from '../models/Log.js'; 

const router = express.Router();

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
    const publicaciones = await Publicacion.find({ autor: req.params.id })
      .sort({ fechaCreacion: -1 });

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




router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreUsuario, password } = req.body;

    
    const ipUsuario = req.ip || req.socket.remoteAddress;
    const horaOficial = await obtenerHoraNTP();

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

    // LOG
    if (seCambioContrasena) {
      await new Log({
        accion: 'CONTRASENA_ACTUALIZADA',
        usuario: id,
        detalles: `El usuario actualizó su contraseña`,
        ip: ipUsuario,
        fechaHora: horaOficial
      }).save();
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
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

  
    const ipUsuario = req.ip || req.socket.remoteAddress;
    const horaOficial = await obtenerHoraNTP();

   
    const usuarioEliminado = await User.findByIdAndDelete(id);

    if (!usuarioEliminado) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    
    await Publicacion.deleteMany({ autor: id });

    // log
    await new Log({
      accion: 'CUENTA_ELIMINADA',
      detalles: `El usuario ${usuarioEliminado.email} eliminó su cuenta definitivamente junto con sus publicaciones`,
      ip: ipUsuario,
      fechaHora: horaOficial
    }).save();

    res.status(200).json({
      mensaje: 'Cuenta y publicaciones eliminadas correctamente'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar la cuenta' });
  }
});

export default router;