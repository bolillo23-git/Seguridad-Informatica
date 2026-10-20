import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  nombreUsuario: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    enum: ['usuario', 'moderador', 'admin'],
    default: 'usuario'
  },
  estado: {
    type: String,
    enum: ['activo', 'suspendido', 'bloqueado'],
    default: 'activo'
  },
  amigos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  solicitudes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  fotoPerfil: {
    type: String,
    default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
  },
  fotoPortada: {
    type: String,
    default: 'https://images.unsplash.com/photo-1707343843437-caacff5cfa74?q=80&w=1000&auto=format&fit=crop'
  },
  // NUEVOS CAMPOS NTP:
  fechaCreacion: {
    type: Date
  },
  ultimoLogin: {
    type: Date
  }
});

export default mongoose.model('User', userSchema);