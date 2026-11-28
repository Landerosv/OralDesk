
const Sucursal = require('../models/sucursal');
const { HttpError } = require('../middlewares/errorHandler');

const CAMPOS = ['nombre', 'direccion', 'telefono', 'horaApertura', 'horaCierre', 'consultorios', 'activo'];

  function tomarCampos(body) {
    const datos = {};
    for (const campo of CAMPOS) {
      if (body[campo] !== undefined) datos[campo] = body[campo];
    }
    return datos;
  }

  // Se llama después de validate(), cuando el formato HH:MM ya se comprobó
  function validarHorario(sucursal) {
    if (sucursal.horaApertura >= sucursal.horaCierre) {
      throw new HttpError(400, 'La hora de apertura debe ser anterior a la de cierre');
    }
  }

  // Limita toda consulta a la organización de quien hace la petición.
  // El organizacionId sale del token, nunca de lo que mande la pantalla.
  function deMiOrganizacion(req, extra = {}) {
    return { ...extra, organizacionId: req.usuario.organizacionId };
  }

  // CREATE: POST /api/sucursales
  async function crear(req, res, next) {
    try {
      const sucursal = new Sucursal({
        ...tomarCampos(req.body || {}),
        organizacionId: req.usuario.organizacionId
      });
      await sucursal.validate();
      validarHorario(sucursal);
      await sucursal.save();
      res.status(201).json(sucursal);
    } catch (error) {
      next(error);
    }
  }

  // READ (lista): GET /api/sucursales?activo=true&buscar=centro
  async function listar(req, res, next) {
    try {
      const filtro = deMiOrganizacion(req);
      if (req.query.activo === 'true') filtro.activo = true;
      if (req.query.activo === 'false') filtro.activo = false;
      if (req.query.buscar) {
        // Se escapan los símbolos especiales para que el texto se busque tal cual
        const texto = String(req.query.buscar).trim().slice(0, 50).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filtro.nombre = { $regex: texto, $options: 'i' };
      }
      const sucursales = await Sucursal.find(filtro).select('-__v').sort({ nombre: 1 });
      res.status(200).json(sucursales);
    } catch (error) {
        next(error);
      }
  }

  // READ (una): GET /api/sucursales/:id
  async function obtener(req, res, next) {
    try {
      const sucursal = await Sucursal.findOne(deMiOrganizacion(req, { _id: req.params.id })).select('-__v');
      if (!sucursal) throw new HttpError(404, 'Sucursal no encontrada');
      res.status(200).json(sucursal);
    } catch (error) {
      next(error);
    }
  }

  // UPDATE: PUT /api/sucursales/:id
  async function actualizar(req, res, next) {
    try {
      const sucursal = await Sucursal.findOne(deMiOrganizacion(req, { _id: req.params.id }));
      if (!sucursal) throw new HttpError(404, 'Sucursal no encontrada');
      const datos = tomarCampos(req.body || {});
      if (Object.keys(datos).length === 0) {
        throw new HttpError(400, 'No se envió ningún campo para actualizar');
      }
      Object.assign(sucursal, datos);
      await sucursal.validate();
      validarHorario(sucursal);
      await sucursal.save();
      res.status(200).json(sucursal);
    } catch (error) {
        next(error);
      }
  }

  // DELETE: DELETE /api/sucursales/:id  (no borra: desactiva)
  async function desactivar(req, res, next) {
  try {
    const sucursal = await Sucursal.findOne(deMiOrganizacion(req, { _id: req.params.id }));
    if (!sucursal) throw new HttpError(404, 'Sucursal no encontrada');

    sucursal.activo = false;
    await sucursal.save();
    res.status(200).json({ msg: 'Sucursal desactivada' });
  } catch (error) {
      next(error);
    }
  }

  module.exports = { crear, listar, obtener, actualizar, desactivar };