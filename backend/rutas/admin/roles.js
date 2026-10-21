import express from 'express';
import User from '../../models/User.js';

const router = express.Router();


// Ruta GET para buscar usuarios por correo
router.get('/buscar', async (req, res) => {
  try {
    const idSolicitante = req.headers['usuario-id'];

    if (!idSolicitante) {
      return res.status(401).json({ mensaje: 'Falta identificación' });
    }

    const solicitante = await User.findById(idSolicitante);

    // CORRECCIÓN: Aquí faltaba el "if" y evaluar que realmente sea admin
    if (!solicitante || solicitante.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'Acceso denegado: No tienes permisos de administrador.' });
    }

    // Si pasó el filtro, hacemos la búsqueda normal
    const { correo } = req.query;

    if (!correo) {
      const usuarios = await User.find().select('-password');
      return res.status(200).json(usuarios);
    }

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
    // 1. BLINDAJE DE SEGURIDAD: Verificamos que el que hace la petición sea un admin
    const idSolicitante = req.headers['usuario-id'];
    if (!idSolicitante) {
      return res.status(401).json({ mensaje: 'Falta identificación' });
    }

    const solicitante = await User.findById(idSolicitante);
    if (!solicitante || solicitante.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'Acceso denegado: Solo un administrador puede cambiar roles.' });
    }

    // 2. Lógica normal para cambiar el rol
    const { id } = req.params;
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
    const usuarios = await User.find().select('-password');
    res.status(200).json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener usuarios' });
  }
});

export default router;