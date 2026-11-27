const form = document.getElementById('formLogin');
const campoCorreo = document.getElementById('correo');
const campoPassword = document.getElementById('password');
const casillaRecordar = document.getElementById('recordar');
const mensaje = document.getElementById('mensaje');
const boton = document.getElementById('btnEntrar');

const TIEMPO_MAXIMO_MS = 15000;

function mostrarError(texto, campo) {
  mensaje.textContent = texto;
  if (campo) campo.focus(); // lleva el cursor al campo que hay que corregir
}

function guardarSesion(datos, recordar) {
  // Se limpian ambos almacenes para que no quede un token viejo en el otro
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('usuario');

  const almacen = recordar ? localStorage : sessionStorage;
  almacen.setItem('token', datos.token);
  almacen.setItem('usuario', JSON.stringify(datos.usuario));
}

// El aviso desaparece en cuanto el usuario vuelve a escribir
form.addEventListener('input', () => { mensaje.textContent = ''; });

form.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  mostrarError('');

  const correo = campoCorreo.value.trim();
  const password = campoPassword.value;

  if (!correo) return mostrarError('Escribe tu correo.', campoCorreo);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) return mostrarError('El correo no tiene un formato válido.', campoCorreo);
  if (!password) return mostrarError('Escribe tu contraseña.', campoPassword);

  boton.disabled = true;
  boton.textContent = 'Entrando...';

  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_MAXIMO_MS);

  try {
    const respuesta = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, password, recordar: casillaRecordar.checked }),
      signal: controlador.signal
    });
    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
      campoPassword.value = ''; // el servidor rechazó los datos: se borra la contraseña
      return mostrarError(datos.msg || 'No se pudo iniciar sesión.', campoPassword);
    }

    guardarSesion(datos, casillaRecordar.checked);
    mensaje.textContent = 'Sesión iniciada correctamente'; // aquí irá la redirección a principal.html
  } catch (error) {
    // Falla de red o tiempo agotado: la contraseña NO se borra, el usuario no se equivocó
    mostrarError(error.name === 'AbortError'
      ? 'El servidor tardó demasiado en responder. Intenta de nuevo.'
      : 'No se pudo conectar con el servidor. Intenta de nuevo.');
  } finally {
    clearTimeout(temporizador);
    boton.disabled = false;
    boton.textContent = 'Entrar';
  }
});