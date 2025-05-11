// Validación básica del formulario de inicio de sesión
document.getElementById('login-form').addEventListener('submit', function(e) {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('login-error-message');
    
    if(email === '' || password === '') {
      errorMessage.textContent = 'Por favor, completa ambos campos.';
      e.preventDefault();
    } else {
      errorMessage.textContent = '';
      // Aquí podrías agregar la lógica para autenticar al usuario.
    }
  });