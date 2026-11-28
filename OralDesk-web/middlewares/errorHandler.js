////////////////////////

    class HttpError extends Error {
        constructor(status, mensaje) {
            super(mensaje);
            this.status = status;
        }
    }
    function rutaNoEncontrada(req, res, next) {
        next(new HttpError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
    }
    
    function manejadorErrores(err, req, res, next) {
      let status = err.status || 500;
      let mensaje = err.message;

      if (err.type === 'entity.parse.failed') {
        status = 400;
        mensaje = 'El cuerpo de la petición no es un JSON válido';
      }

      if (err.name === 'ValidationError') {
        status = 400;
        mensaje = Object.values(err.errors).map((e) => e.message).join('. ');
      }
      if (err.code === 11000) {
        status = 409;
        mensaje = 'Ya existe un registro con ese valor';
      }
      if (err.name === 'CastError') {
        status = 400;
        mensaje = 'El identificador no es válido';
      }

      if (status === 500) {
        console.error(err);
        mensaje = 'Error interno del servidor';
      }
      res.status(status).json({ msg: mensaje });
  }
    module.exports = { HttpError, rutaNoEncontrada, manejadorErrores };