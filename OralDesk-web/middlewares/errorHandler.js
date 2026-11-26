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
        const status = err.status || 500;
        if (status === 500) console.error(err);
        res.status(status).json({ msg: status === 500 ? 'Error interno del servidor' : err.message });
    }
    module.exports = { HttpError, rutaNoEncontrada, manejadorErrores };