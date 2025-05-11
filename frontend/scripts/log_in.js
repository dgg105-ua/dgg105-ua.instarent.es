// Esperar a que el DOM cargue antes de ejecutar el código
document.addEventListener('DOMContentLoaded', function() {
  // Revisar si el usuario ya tiene sesión activa
  const savedUser = localStorage.getItem('loggedInUser');
  if (savedUser) {
      window.location.href = 'perfil.html'; // Redirige automáticamente
  }

  // Manejo del botón de inicio de sesión con Google (simulado)
  document.querySelector('.google-login').addEventListener('click', function() {
      alert('Función de inicio de sesión con Google aún no implementada.');
  });

  // Validación del formulario de inicio de sesión
  document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault(); 

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (email === '' || password === '') {
        showError('Por favor, completa ambos campos.');
        return;
    }

    if (!validarEmail(email)) {
        showError('Por favor, introduce un correo válido.');
        return;
    }

    try {
        const response = await fetch('scripts/users.json');
        const users = await response.json();

        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            showError('Correo o contraseña incorrectos.');
            return;
        }

        if (document.getElementById('keep-session').checked) {
            localStorage.setItem('loggedInUser', email);
        }

        window.location.href = 'perfil.html';

    } catch (error) {
        console.error('Error al cargar los datos:', error);
        showError('Error en el servidor. Inténtalo más tarde.');
    }
  });


  // Función para validar formato de email
  function validarEmail(email) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
  }

  // Ocultar mensaje de error después de 3 segundos
  function desaparecerMensaje() {
      setTimeout(() => {
          const errorMessage = document.getElementById('login-error-message');
          if (errorMessage) { // Evitar error si no existe
              errorMessage.style.display = 'none';
          }
      }, 3000);
  }

  // 🔹 VERIFICAR SI EL BOTÓN DE MOSTRAR CONTRASEÑA EXISTE ANTES DE AGREGAR EVENTO
  const togglePasswordButton = document.getElementById('toggle-password');
  if (togglePasswordButton) {
      togglePasswordButton.addEventListener('click', function() {
          let passField = document.getElementById('password');
          passField.type = passField.type === 'password' ? 'text' : 'password';
      });
  }

  // Función para mostrar mensajes de error
  function showError(message) {
      let errorMessage = document.getElementById('login-error-message');

      if (!errorMessage) {
          // Si no existe, crearlo dinámicamente
          errorMessage = document.createElement('p');
          errorMessage.id = 'login-error-message';
          errorMessage.style.color = 'red';
          errorMessage.style.display = 'block';
          document.getElementById('login-form').prepend(errorMessage);
      }

      errorMessage.textContent = message;
      errorMessage.style.display = 'block';
      desaparecerMensaje();
  }
});