import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import rutasRegistro from './rutas/registro.js';
import rutasLogin from './rutas/login.js';
import rutasPublicaciones from './rutas/publicaciones.js'; 
import rutasPerfil from './rutas/perfil.js';
import moderadorSanciones from './rutas/moderador/sanciones.js';
import moderadorPublicaciones from './rutas/moderador/publicaciones.js';
import adminRoles from './rutas/admin/roles.js';
import rutasAmigos from './rutas/amigos.js'
import rutasUsuarios from './rutas/usuarios.js';
import rutasMensajes from './rutas/mensajes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conexión exitosa a MongoDB'))
  .catch((err) => console.error('Error conectando a Mongo:', err));

app.use('/api/registro', rutasRegistro);
app.use('/api/login', rutasLogin);
app.use('/api/publicaciones', rutasPublicaciones); 
app.use('/api/perfil', rutasPerfil);
app.use('/api/moderador/sanciones', moderadorSanciones);
app.use('/api/moderador/publicaciones', moderadorPublicaciones);
app.use('/api/admin/roles', adminRoles);
app.use('/api/amigos', rutasAmigos);
app.use('/api/usuarios', rutasUsuarios)
app.use('/api/mensajes', rutasMensajes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});