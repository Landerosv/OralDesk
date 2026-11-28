require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Usuario = require('./models/usuario');
const Organizacion = require('./models/organizacion');

async function crearAdmin() {
  const [organizacion, nombre, correo, password] = process.argv.slice(2);

  if (!organizacion || !nombre || !correo || !password) {
    console.log('Uso: node crearAdmin.js "Organización" "Nombre" correo@ejemplo.com contraseña');
    return;
  }
  if (password.length < 8 || password.length > 72) {
    console.log('La contraseña debe tener entre 8 y 72 caracteres.');
    return;
  }

  let org;
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Se revisa antes para no dejar una organización vacía si el correo ya existe
    if (await Usuario.exists({ correo: correo.toLowerCase().trim() })) {
      console.error('Ese correo ya está registrado.');
      return;
    }

    org = await Organizacion.create({ nombre: organizacion });
    const hash = await bcrypt.hash(password, 10);
    await Usuario.create({
      nombre, correo, password: hash,
      rol: 'propietario', esDentista: true,
      organizacionId: org._id
    });
    console.log('Organización y usuario propietario creados');
  } catch (error) {
    // Si falló algo después de crear la organización, se quita para no dejarla huérfana
    if (org) await Organizacion.deleteOne({ _id: org._id });
    if (error.code === 11000) console.error('Ese correo ya está registrado.');
    else console.error('No se pudo crear:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

crearAdmin();