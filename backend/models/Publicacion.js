import mongoose from 'mongoose';

const publicacionSchema = new mongoose.Schema({
  contenido: {
    type: String,
    required: true,
    maxlength: 500 // Un límite razonable para el texto
  },
  autor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Esta es la magia: vincula la publicación con el ID de tu modelo User
    required: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Publicacion', publicacionSchema);