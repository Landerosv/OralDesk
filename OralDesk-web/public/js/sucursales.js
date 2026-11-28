const sesion = validarAcceso();
const esPropietario = sesion && sesion.usuario.rol === 'propietario';

const tabla = document.getElementById('tabla');
const mensaje = document.getElementById('mensaje');
const form = document.getElementById('formSucursal');
const mensajeForm = document.getElementById('mensajeForm');
const tituloForm = document.getElementById('tituloForm');
const btnGuardar = document.getElementById('btnGuardar');
const btnCancelar = document.getElementById('btnCancelar');

  // Solo deja escribir dígitos en el teléfono (también cuando se pega texto)
  form.elements.telefono.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
  });
// Solo el propietario ve el formulario y la columna de acciones
document.getElementById('seccionForm').hidden = !esPropietario;
document.getElementById('thAcciones').hidden = !esPropietario;

let idEditando = null; // null = se está creando; con valor = se está editando esa sucursal

function limpiarFormulario() {
  form.reset(); // vuelve a los valores iniciales (la casilla "Activa" queda marcada)
  idEditando = null;
  tituloForm.textContent = 'Nueva sucursal';
  btnGuardar.textContent = 'Crear sucursal';
  btnCancelar.hidden = true;
  mensajeForm.textContent = '';
}

function editar(s) {
  const c = form.elements;
  idEditando = s._id;
  c.nombre.value = s.nombre;
  c.direccion.value = s.direccion;
  c.telefono.value = s.telefono || '';
  c.horaApertura.value = s.horaApertura;
  c.horaCierre.value = s.horaCierre;
  c.consultorios.value = s.consultorios;
  c.activo.checked = s.activo;

  tituloForm.textContent = 'Editar sucursal';
  btnGuardar.textContent = 'Guardar cambios';
  btnCancelar.hidden = false;
  mensajeForm.textContent = '';
  form.scrollIntoView();
}

function crearFila(s) {
  const tr = document.createElement('tr');
  const valores = [
    s.nombre,
    s.direccion,
    s.telefono || '—',
    s.horaApertura + ' - ' + s.horaCierre,
    s.consultorios,
    s.activo ? 'Activa' : 'Inactiva'
  ];
  for (const valor of valores) {
    const td = document.createElement('td');
    td.textContent = valor;
    tr.appendChild(td);
  }

  if (esPropietario) {
    const td = document.createElement('td');
    const botonEditar = document.createElement('button');
    botonEditar.type = 'button';
    botonEditar.textContent = 'Editar';
    botonEditar.addEventListener('click', () => editar(s));
    td.appendChild(botonEditar);
    tr.appendChild(td);
  }
  return tr;
}

async function cargarSucursales() {
  mensaje.textContent = 'Cargando...';
  try {
    const r = await api('/api/sucursales');
    if (!r.ok) {
      mensaje.textContent = r.datos.msg || 'No se pudieron cargar las sucursales.';
      return;
    }
    tabla.innerHTML = '';
    for (const sucursal of r.datos) tabla.appendChild(crearFila(sucursal));
    mensaje.textContent = r.datos.length ? '' : 'Todavía no hay sucursales registradas.';
  } catch (error) {
    mensaje.textContent = 'No se pudo conectar con el servidor. Intenta de nuevo.';
  }
}

form.addEventListener('submit', async (evento) => {
  evento.preventDefault(); // evita que el navegador recargue la página
  mensajeForm.textContent = '';

  const c = form.elements;
  const datos = {
    nombre: c.nombre.value.trim(),
    direccion: c.direccion.value.trim(),
    telefono: c.telefono.value.trim(),
    horaApertura: c.horaApertura.value,
    horaCierre: c.horaCierre.value,
    consultorios: Number(c.consultorios.value),
    activo: c.activo.checked
  };

  btnGuardar.disabled = true; // evita doble clic y sucursales duplicadas
  try {
    const r = idEditando
      ? await api('/api/sucursales/' + idEditando, 'PUT', datos)
      : await api('/api/sucursales', 'POST', datos);

    if (!r.ok) {
      mensajeForm.textContent = r.datos.msg || 'No se pudo guardar.';
      return; // el formulario conserva lo que escribió para que corrija
    }

    limpiarFormulario();
    mensajeForm.textContent = 'Sucursal guardada correctamente.';
    await cargarSucursales();
  } catch (error) {
    mensajeForm.textContent = 'No se pudo conectar con el servidor. Intenta de nuevo.';
  } finally {
    btnGuardar.disabled = false;
  }
});

btnCancelar.addEventListener('click', limpiarFormulario);

if (sesion) cargarSucursales();