const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const { HttpError } = require('../middlewares/errorHandler');

const MAX_INTENTOS = 5;
const MINUTOS_BLOQUEO = 15;
// Hash falso: se compara contra él cuando el correo no existe, para tardar lo mismo
const HASH_FALSO = bcrypt.hashSync('contraseña-falsa-para-igualar-tiempos', 10);

async function registrarFallo(usuario) {
  if (usuario.intentosFallidos + 1 >= MAX_INTENTOS) {
    await Usuario.updateOne({ _id: usuario._id }, {
      intentosFallidos: 0,
      bloqueadoHasta: new Date(Date.now() + MINUTOS_BLOQUEO * 60000)
    });
  } else {
    await Usuario.updateOne({ _id: usuario._id }, { $inc: { intentosFallidos: 1 } });
  }
}

async function login(req, res, next) {
  try {
    const { correo, password, recordar } = req.body || {}; // req.body puede venir vacío

    if (typeof correo !== 'string' || typeof password !== 'string' || !correo.trim() || !password) {
      throw new HttpError(400, 'El correo y la contraseña son obligatorios');
    }
    if (correo.length > 254 || password.length > 72) {
      throw new HttpError(400, 'El correo o la contraseña exceden la longitud permitida');
    }

    const usuario = await Usuario.findOne({ correo: correo.toLowerCase().trim() }).select('+password');

    if (usuario && usuario.bloqueadoHasta && usuario.bloqueadoHasta > new Date()) {
      const minutos = Math.ceil((usuario.bloqueadoHasta - new Date()) / 60000);
      throw new HttpError(429, `Demasiados intentos fallidos. Intenta de nuevo en ${minutos} minuto(s).`);
    }

    // Siempre se compara, exista o no el usuario
    const coincide = await bcrypt.compare(password, usuario ? usuario.password : HASH_FALSO);

    if (!usuario || !usuario.activo || !coincide) {
      if (usuario) await registrarFallo(usuario);
      throw new HttpError(401, 'Correo o contraseña incorrectos');
    }

    // Acceso correcto: se reinicia el contador de fallos
    if (usuario.intentosFallidos || usuario.bloqueadoHasta) {
      await Usuario.updateOne({ _id: usuario._id }, { intentosFallidos: 0, $unset: { bloqueadoHasta: '' } });
    }

    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: recordar === true ? '7d' : '8h' }
    );

    res.set('Cache-Control', 'no-store'); // que ningún navegador ni intermediario guarde el token
    res.status(200).json({ token, usuario });
  } catch (error) {
    next(error);
  }
}

module.exports = { login };