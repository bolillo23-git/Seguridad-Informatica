import mongoose from 'mongoose';

const mensajeSchema = new mongoose.Schema({
    remitente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    destinatario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    contenido: {
        type: String,
        required: true
    },
    fechaEnvio: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Mensaje', mensajeSchema);