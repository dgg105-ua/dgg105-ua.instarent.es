// Validación: comprobamos que ambas contraseñas coinciden y mostramos un mensaje si no es así.
document.getElementById('register-form').addEventListener('submit', function(e) {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorMessage = document.getElementById('error-message');
    if (password !== confirmPassword) {
      errorMessage.textContent = 'Las contraseñas no coinciden.';
      e.preventDefault();
    } else {
      errorMessage.textContent = '';
    }
  });