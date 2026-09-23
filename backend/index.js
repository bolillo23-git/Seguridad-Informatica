import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import rutasRegistro from './routes/registro.js'; 
import rutasLogin from './routes/login.js';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conexión exitosa a MongoDB'))
  .catch((err) => console.error('Error conectando a Mongo:', err));

app.use('/api/registro', rutasRegistro); 
app.use('/api/login', rutasLogin);

app.listen(3000, () => {
    console.log('Servidor escuchando en el puerto 3000');
});