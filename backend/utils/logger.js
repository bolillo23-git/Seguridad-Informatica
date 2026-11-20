import Log from '../models/Log.js';
import { obtenerHoraNTP } from './tiempo.js';

export const registrarLog = async (accion, detalles, req, idUsuario = null) => {
    try {
        const ip = req.ip || req.socket.remoteAddress;
        const machineId = req.header('X-Machine-Id') || 'Desconocido';
        const fechaHora = await obtenerHoraNTP();

        await new Log({
            accion,
            detalles,
            usuario: idUsuario,
            ip,
            machineId,
            fechaHora
        }).save();
    } catch (error) {
        console.error('Error al guardar el log:', error);
    }
};