
  const jwt = require('jsonwebtoken');
  const Usuario = require('../models/usuario');
  const Organizacion = require('../models/organizacion');

  module.exports = async function verificarToken(req, res, next) {
    const encabezado = req.headers.authorization;
    if (!encabezado || !encabezado.startsWith('Bearer ')) {
      return res.status(401).json({ msg: 'Token requerido' });
    }
    const token = encabezado.split(' ')[1];

    let datos;
    try {
      datos = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    } catch (error) {
      return res.status(401).json({ msg: 'Token inválido o expirado' });
    }
    if (!datos.organizacionId) {
     return res.status(401).json({ msg: 'Sesión no válida. Inicia sesión de nuevo.' });
    }

    try {
      // Se consulta la base: el token solo dice quién eres, no si todavía tienes acceso
      const usuario = await Usuario.findById(datos.id).select('rol activo organizacionId');
      if (!usuario || !usuario.activo) {
        return res.status(401).json({ msg: 'Tu cuenta está desactivada o ya no existe.' });
      }
      const organizacionActiva = await Organizacion.exists({ _id: usuario.organizacionId, activo: true });
      if (!organizacionActiva) {
        return res.status(401).json({ msg: 'La organización está desactivada.' });
      }

      // Se usan los datos actuales de la base, no los que quedaron en el token
      req.usuario = {
        id: usuario._id.toString(),
        rol: usuario.rol,
        organizacionId: usuario.organizacionId.toString()
      };
      next();
    } catch (error) {
      next(error);
    }
  };