
    const { Router } = require('express');
    const { login } = require('../controllers/auth');
    const router = Router();
    router.post('/login', login);

    module.exports = router;
    const verificarToken = require('../middlewares/verificarToken');
