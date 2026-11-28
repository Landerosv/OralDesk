
  const mongoose = require('mongoose');

  const organizacionSchema = new mongoose.Schema({
    nombre: {
      type: String,
      required: [true, 'El nombre de la organización es obligatorio'],
      trim: true,
      maxlength: [100, 'El nombre no puede pasar de 100 caracteres']
    },
      activo: { type: Boolean, default: true }
  }, { timestamps: true });

  module.exports = mongoose.model('Organizacion', organizacionSchema, 'organizaciones');