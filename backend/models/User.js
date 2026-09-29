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
    default: 'usuario' // Todos los que se registren por la web serán 'usuario' por defecto
  },
  estado: {
    type: String,
    enum: ['activo', 'suspendido', 'bloqueado'],
    default: 'activo' // Todos empiezan activos
  }
});

export default mongoose.model('User', userSchema);