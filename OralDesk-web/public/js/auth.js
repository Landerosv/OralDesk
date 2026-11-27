

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