

  const jwt = require('jsonwebtoken');
  
  module.exports = function verificarToken(req, res, next) {
    const encabezado = req.headers.authorization;

    if (!encabezado || !encabezado.startsWith('Bearer ')) {
      return res.status(401).json({ msg: 'Token requerido' });
    }
    const token = encabezado.split(' ')[1];
    try {
      const datos = jwt.verify(token, process.env.JWT_SECRET);
      req.usuario = datos;
      next();
    } catch (error) {
      return res.status(401).json({ msg: 'Token inválido o expirado' });
    }
  };