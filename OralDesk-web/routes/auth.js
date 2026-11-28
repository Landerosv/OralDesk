
    const { Router } = require('express');
    const { rateLimit } = require('express-rate-limit');
    const { login } = require('../controllers/auth');
    const { registrar } = require('../controllers/registro');

    const router = Router();

    // Máximo 5 registros por hora desde la misma conexión
    const limiteRegistro = rateLimit({
        windowMs: 60 * 60 * 1000,
        limit: 5,
        standardHeaders: true,
        legacyHeaders: false,
        message: { msg: 'Demasiados registros desde esta conexión. Intenta más tarde.' }
    });

    router.post('/login', login);
    router.post('/registro', limiteRegistro, registrar);

    module.exports = router;
