
const mongoose = require('mongoose');

const horaRegex = /^([01]\d|2[0-3]):[0-5]\d$/; // formato 24 h, por ejemplo 09:00

const sucursalSchema = new mongoose.Schema({
    
  organizacionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organizacion',
    required: [true, 'La organización es obligatoria'],
    immutable: true
  },
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    maxlength: [80, 'El nombre no puede pasar de 80 caracteres']
  },
  
  direccion: {
    type: String,
    required: [true, 'La dirección es obligatoria'],
    trim: true,
    maxlength: [200, 'La dirección no puede pasar de 200 caracteres']
  },
  telefono: {
    type: String,
    trim: true,
    match: [/^[0-9 +()-]{7,20}$/, 'El teléfono solo puede llevar números, espacios, + ( ) y -']
  },

  horaApertura: {
    type: String,
    required: [true, 'La hora de apertura es obligatoria'],
    match: [horaRegex, 'La hora de apertura debe tener formato HH:MM']
  },
  horaCierre: {
    type: String,
    required: [true, 'La hora de cierre es obligatoria'],
    match: [horaRegex, 'La hora de cierre debe tener formato HH:MM']
  },
  consultorios: {
    type: Number,
    required: [true, 'El número de consultorios es obligatorio'],
    min: [1, 'Debe haber al menos un consultorio'],
    max: [50, 'El máximo es 50 consultorios'],
    validate: { validator: Number.isInteger, message: 'Los consultorios deben ser un número entero' }
  },
  activo: { type: Boolean, default: true }
}, { timestamps: true });

sucursalSchema.index({ organizacionId: 1, nombre: 1 }, { unique: true, collation: { locale: 'es', strength: 2 } });
module.exports = mongoose.model('Sucursal', sucursalSchema, 'sucursales');