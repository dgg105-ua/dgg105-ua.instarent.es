// detalle.js
document.addEventListener("DOMContentLoaded", () => {
    // Array de imágenes (hasta 8). Ajusta según tus nombres de archivo
    const images = [
      "img/listing_piso_1.png",
      "img/listing_piso_2.png",
      "img/listing_piso_3.png",
      "img/listing_piso_4.png",
      "img/listing_piso_5.png",
      "img/listing_piso_6.png",
      "img/listing_piso_7.png",
      "img/listing_piso_8.png"
      // ... si quieres llegar a listing_piso8.png, añádelos
    ];
  
    let currentIndex = 0; // índice de la imagen principal
  
    const mainImage = document.getElementById("main-image");
    const arrowLeft = document.getElementById("arrow-left");
    const arrowRight = document.getElementById("arrow-right");
    const thumbnails = document.querySelectorAll(".thumb");
  
    // Función para actualizar la imagen principal
    function updateMainImage(index) {
      mainImage.src = images[index];
    }
  
    // Evento flecha izquierda
    arrowLeft.addEventListener("click", () => {
      currentIndex--;
      if (currentIndex < 0) {
        currentIndex = images.length - 1; // vuelve al final
      }
      updateMainImage(currentIndex);
    });
  
    // Evento flecha derecha
    arrowRight.addEventListener("click", () => {
      currentIndex++;
      if (currentIndex >= images.length) {
        currentIndex = 0; // vuelve al inicio
      }
      updateMainImage(currentIndex);
    });
  
    // Evento en miniaturas
    thumbnails.forEach((thumb, idx) => {
      thumb.addEventListener("click", () => {
        currentIndex = idx + 1; 
        // Asumimos que listing_piso2.png se corresponde con idx=0 en la lista, 
        // y listing_piso1.png es images[0].
        // Ajusta según tu orden real.
        // O, si coinciden exactamente con el array, 
        // podrías usar "currentIndex = idx" directamente.
        if (currentIndex >= images.length) {
          currentIndex = images.length - 1;
        }
        updateMainImage(currentIndex);
      });
    });
  });
  