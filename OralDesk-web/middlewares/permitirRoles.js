
  const { HttpError } = require('./errorHandler');

  module.exports = function permitirRoles(...roles) {
    return (req, res, next) => {
      if (!req.usuario || !roles.includes(req.usuario.rol)) {
        return next(new HttpError(403, 'No tienes permiso para realizar esta acción'));
      }
      next();
    };
  };