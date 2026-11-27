const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: [true, 'El nombre es obligatorio'], trim: true },
  correo: {
    type: String,
    required: [true, 'El correo es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^@\s]+@[^@\s]+\.[^@\s]+$/, 'El correo no tiene un formato válido']
  },
  password: { type: String, required: [true, 'La contraseña es obligatoria'], select: false },
  rol: { type: String, enum: ['propietario', 'personal'], default: 'personal' },
  esDentista: { type: Boolean, default: false },
  activo: { type: Boolean, default: true },
  intentosFallidos: { type: Number, default: 0 },
  bloqueadoHasta: { type: Date }
}, { timestamps: true });

// Nunca devolver datos internos de seguridad en las respuestas
usuarioSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.intentosFallidos;
    delete ret.bloqueadoHasta;
    return ret;
  }
});

module.exports = mongoose.model('Usuario', usuarioSchema, 'usuarios');