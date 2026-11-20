import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({

    accion: { type: String, required: true },

    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    detalles: { type: String },

    ip: { type: String },
    
    machineId: { type: String }, 
    
    fechaHora: { type: Date, required: true }
});

export default mongoose.model('Log', logSchema);