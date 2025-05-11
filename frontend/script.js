document.addEventListener("DOMContentLoaded", function() {
    // Botones de la sección de anuncios (precio)
    const priceButtons = document.querySelectorAll(".info button");
    priceButtons.forEach(button => {
      button.addEventListener("click", function() {
        alert("Mostrando información del precio");
      });
    });
  
    // Botones de la sección de filtros
    const applyFiltersButton = document.querySelector(".apply-filters");
    if (applyFiltersButton) {
      applyFiltersButton.addEventListener("click", function() {
        alert("Filtros aplicados");
      });
    }
  
    const clearFiltersButton = document.querySelector(".clear-filters");
    if (clearFiltersButton) {
      clearFiltersButton.addEventListener("click", function() {
        alert("Filtros limpiados");
      });
    }

    
    // Manejador de evento para redireccionar al detalle del piso al hacer clic en una propiedad
    const properties = document.querySelectorAll(".property");
    properties.forEach(property => {
      property.addEventListener("click", function() {
        window.location.href = "pisos.html";
      });
    });
  });


  
  