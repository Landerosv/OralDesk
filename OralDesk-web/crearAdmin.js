require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Usuario = require('./models/usuario');

async function crearAdmin() {
  const [nombre, correo, password] = process.argv.slice(2);

  if (!nombre || !correo || !password) {
    console.log('Uso: node crearAdmin.js "Nombre" correo@ejemplo.com contraseña');
    return;
  }
  if (password.length < 8 || password.length > 72) {
    console.log('La contraseña debe tener entre 8 y 72 caracteres.');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const hash = await bcrypt.hash(password, 10);
    await Usuario.create({ nombre, correo, password: hash, rol: 'propietario', esDentista: true });
    console.log('Usuario propietario creado');
  } catch (error) {
    if (error.code === 11000) console.error('Ese correo ya está registrado.');
    else console.error('No se pudo crear el usuario:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

crearAdmin();