const { Router } = require('express');
const verificarToken = require('../middlewares/verificarToken');
const permitirRoles = require('../middlewares/permitirRoles');
const { crear, listar, obtener, actualizar, desactivar } = require('../controllers/sucursales');

const router = Router();

router.use(verificarToken); // todas las rutas de este archivo exigen token

// Consultar: cualquier trabajador (el personal necesita ver sucursales para agendar)
router.get('/', permitirRoles('propietario', 'personal'), listar);
router.get('/:id', permitirRoles('propietario', 'personal'), obtener);

// Crear, editar y desactivar: solo el propietario
router.post('/', permitirRoles('propietario'), crear);
router.put('/:id', permitirRoles('propietario'), actualizar);
router.delete('/:id', permitirRoles('propietario'), desactivar);

module.exports = router;