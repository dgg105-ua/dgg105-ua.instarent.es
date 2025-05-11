// Seleccionamos todos los .trabajador
const trabajadores = document.querySelectorAll('.trabajador');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const contratarBtn = document.getElementById('contratarBtn');
const phoneNumber = document.getElementById('phoneNumber');

// Al hacer clic en cualquier anuncio de trabajador, abrimos el modal
trabajadores.forEach(trab => {
  trab.addEventListener('click', () => {
    modal.style.display = 'block';
  });
});

// Al hacer clic en la X, cerramos el modal
closeModal.addEventListener('click', () => {
  modal.style.display = 'none';
  // Volvemos a poner el número de teléfono borroso
  phoneNumber.classList.add('blurred');
});

// Al hacer clic en "Contratar", quitamos el blur
contratarBtn.addEventListener('click', () => {
  phoneNumber.classList.remove('blurred');
  alert('Has contratado al trabajador. Ahora puedes ver su teléfono.');
});

// Cerrar modal si el usuario hace clic fuera del contenido
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
    phoneNumber.classList.add('blurred');
  }
});