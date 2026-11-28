
    const bcrypt = require('bcryptjs');
    const Organizacion = require('../models/organizacion');
    const Usuario = require('../models/usuario');
    const Sucursal = require('../models/sucursal');
    const { HttpError } = require('../middlewares/errorHandler');

    const REGEX_CORREO = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    const TIENE_LETRA = /\p{L}/u;

    // Quita espacios de los extremos y junta los repetidos
    const limpiar = (v) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : '');

    // POST /api/auth/registro (ruta pública)
    async function registrar(req, res, next) {
        let organizacion;
        let usuario;
        try {
            const body = req.body || {};
            const nombreOrg = limpiar(body.organizacion);
            const nombre = limpiar(body.nombre);
            const correo = limpiar(body.correo).toLowerCase();
            const password = body.password;
            const esDentista = body.esDentista === true;

        if (!nombreOrg || !nombre || !correo || typeof password !== 'string' || !password) {
            throw new HttpError(400, 'Todos los campos son obligatorios');
        }
        if (nombreOrg.length > 100 || nombre.length > 80 || correo.length > 254) {
            throw new HttpError(400, 'Algún campo excede la longitud permitida');
        }
        if (!TIENE_LETRA.test(nombreOrg) || !TIENE_LETRA.test(nombre)) {
            throw new HttpError(400, 'El nombre de la clínica y tu nombre deben contener letras');
        }
        if (!REGEX_CORREO.test(correo)) {
            throw new HttpError(400, 'El correo no tiene un formato válido');
        }
        if (password.length < 8 || password.length > 72) {
            throw new HttpError(400, 'La contraseña debe tener entre 8 y 72 caracteres');
        }

        // Se revisa antes para no crear una organización que quede vacía
        if (await Usuario.exists({ correo })) {
            throw new HttpError(409, 'Ese correo ya está registrado');
        }

        organizacion = await Organizacion.create({ nombre: nombreOrg });
        const hash = await bcrypt.hash(password, 10);
        usuario = await Usuario.create({
        nombre, correo, password: hash,
        rol: 'propietario', esDentista,
        organizacionId: organizacion._id
    });
    // Sucursal inicial con datos por defecto; el propietario los edita después
    await Sucursal.create({
      organizacionId: organizacion._id,
      nombre: 'Matriz',
      direccion: 'Por definir',
      horaApertura: '09:00',
      horaCierre: '18:00',
      consultorios: 1
    });

    res.status(201).json({ msg: 'Clínica registrada. Ya puedes iniciar sesión.' });
     } catch (error) {
        // Si algo falló a la mitad, se deshace lo creado para no dejar datos huérfanos
            try {
                if (usuario) await Usuario.deleteOne({ _id: usuario._id });
                if (organizacion) await Organizacion.deleteOne({ _id: organizacion._id });
            } catch (e) {
                console.error('No se pudo deshacer el registro:', e.message);
            }
            next(error.code === 11000 ? new HttpError(409, 'Ese correo ya está registrado') : error);
        }
    }

    module.exports = { registrar };