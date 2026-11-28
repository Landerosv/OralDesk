// public/js/auth.js

// El login guardó el token en localStorage (si marcó "recordar") o en sessionStorage.
// Esta función busca en ambos lados.
function obtenerSesion() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const usuario = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');

  if (!token || !usuario) return null;

  try {
    return { token, usuario: JSON.parse(usuario) };
  } catch (error) {
    return null; // el dato guardado estaba dañado
  }
}

// Si no hay sesión, regresa al login. Si hay, devuelve los datos.
function validarAcceso() {
  const sesion = obtenerSesion();
  if (!sesion) {
    window.location.replace('index.html');
    return null;
  }
  return sesion;
}

// Borra la sesión de ambos almacenes y regresa al login
function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('usuario');
  window.location.replace('index.html');
}

// Hace una petición a la API mandando el token. La usarán todas las pantallas.
async function api(url, metodo = 'GET', cuerpo) {
  const sesion = obtenerSesion();
  if (!sesion) {
    window.location.replace('index.html');
    throw new Error('Sin sesión');
  }

  const opciones = { method: metodo, headers: { Authorization: 'Bearer ' + sesion.token } };
  if (cuerpo !== undefined) {
    opciones.headers['Content-Type'] = 'application/json';
    opciones.body = JSON.stringify(cuerpo);
  }

  const respuesta = await fetch(url, opciones);
  const datos = await respuesta.json().catch(() => ({}));

  // Token vencido o inválido: se cierra la sesión y se regresa al login
  if (respuesta.status === 401) {
    cerrarSesion();
    throw new Error('Sesión expirada');
  }

  return { ok: respuesta.ok, status: respuesta.status, datos };
}