import mongoose from 'mongoose';

const publicacionSchema = new mongoose.Schema({
  contenido: {
    type: String,
    required: true,
    maxlength: 500
  },
  autor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fechaCreacion: {
    type: Date 
  },
  fechaEdicion: {
    type: Date
  }
});

export default mongoose.model('Publicacion', publicacionSchema);