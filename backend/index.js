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

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conexión exitosa a MongoDB'))
  .catch((err) => console.error('Error conectando a Mongo:', err));

app.use('/api/registro', rutasRegistro);
app.use('/api/login', rutasLogin);
app.use('/api/publicaciones', rutasPublicaciones); 
app.use('/api/perfil', rutasPerfil);
app.use('/api/moderador/sanciones', moderadorSanciones);
app.use('/api/moderador/publicaciones', moderadorPublicaciones);

app.listen(3000, () => {
    console.log('Servidor escuchando en el puerto 3000');
});