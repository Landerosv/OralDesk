const form = document.getElementById('formRegistro');
const mensaje = document.getElementById('mensaje');
const boton = document.getElementById('btnRegistrar');

form.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  mensaje.textContent = '';
  const c = form.elements;

  if (c.password.value !== c.password2.value) {
    mensaje.textContent = 'Las contraseñas no coinciden.';
    c.password2.focus();
    return;
  }

  boton.disabled = true;
  try {
    const respuesta = await fetch('/api/auth/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organizacion: c.organizacion.value,
        nombre: c.nombre.value,
        correo: c.correo.value,
        password: c.password.value,
        esDentista: c.esDentista.checked
      })
    });
    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
      mensaje.textContent = datos.msg || 'No se pudo registrar.';
      return; // el formulario conserva lo escrito para que corrija
    }

    form.reset();
    mensaje.textContent = datos.msg + ' Redirigiendo al inicio de sesión...';
    setTimeout(() => { window.location.href = 'index.html'; }, 2000);
  } catch (error) {
    mensaje.textContent = 'No se pudo conectar con el servidor. Intenta de nuevo.';
  } finally {
    boton.disabled = false;
  }
});