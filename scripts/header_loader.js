// filepath: c:\Users\saulc\Desktop\Tercero\TAES\TAES-InstaRent\scripts\header_loader.js

// Función para cargar el encabezado desde header.html
document.addEventListener("DOMContentLoaded", function () {
  const headerPlaceholder = document.getElementById("header-placeholder");
  if (headerPlaceholder) {
    fetch("header.html")
      .then((response) => response.text())
      .then((data) => {
        headerPlaceholder.innerHTML = data;

        // Verificar si el usuario ha iniciado sesión
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        const authButtonsContainer = document.getElementById("menu-nav");


        if (authButtonsContainer) {
          if (usuario) {
            // Si el usuario ha iniciado sesión, añadir "Crear", "Ver perfil" y "Cerrar sesión"
            authButtonsContainer.insertAdjacentHTML("beforeend", `
              <li class="nav-item submenu dropdown">
                <a href="#" class="nav-link dropdown-toggle" data-toggle="dropdown"
                   role="button" aria-haspopup="true" aria-expanded="false">Crear</a>
                <ul class="dropdown-menu">
                  <li class="nav-item">
                    <a class="nav-link" href="crear_alquiler.html">Crear Alquiler</a>
                  </li>
                  <li class="nav-item">   
                    <a class="nav-link" href="crear_trabajo.html">Crear Trabajo</a>
                  </li>
                </ul>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="perfil.html">Ver perfil</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#" id="logout-button">Cerrar sesión</a>
              </li>
            `);

            // Añadir evento para cerrar sesión
            document.getElementById("logout-button").addEventListener("click", function () {
              localStorage.removeItem("usuario");
              window.location.reload(); // Recargar la página para actualizar el encabezado
            });
          } else {
            // Si no hay usuario, añadir el botón "Log in"
            authButtonsContainer.insertAdjacentHTML("beforeend", `
              <li class="nav-item">
                <a class="nav-link" href="login.html">Log in</a>
              </li>
            `);
          }
        }
      })
      .catch((error) => console.error("Error al cargar el encabezado:", error));
  }
});