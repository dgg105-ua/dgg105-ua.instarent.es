import { db } from './firebaseConfig.js';  // Asegúrate de importar la configuración de Firebase
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, getDoc } from "firebase/firestore";

export async function readAllUsuarios(filtro=null){
    if(filtro == null){
        const usuarios = await getDocs(collection(db, "usuario"));
        return usuarios.docs.map(doc => doc.data());
    }

    switch(filtro){
        case "inquilino": //Esto será para filtrar por inquilinos
            const inquilinos = await getDocs(query(collection(db, "inquilino")));
            return inquilinos.docs.map(doc => doc.data());

        case "casero": //Esto será para filtrar por caseros
            const propietarios = await getDocs(query(collection(db, "casero")));
            return propietarios.docs.map(doc => doc.data());

        case "trabajador": //Esto será para filtrar por trabajadores
            const trabajadores = await getDocs(query(collection(db, "trabajador")));
            return trabajadores.docs.map(doc => doc.data());

        default:
            console.log("Error: Tipo de filtro no válido.");
            return null;
    }
}

export async function readAllViviendas(tipo = null, filtros = {}) {
  try {
    const refViviendas = collection(db, "vivienda");
    const viviendasSnapshot = await getDocs(refViviendas);
    const viviendas = viviendasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Obtener todos los caseros
    const refCaseros = collection(db, "casero");
    const caserosSnapshot = await getDocs(refCaseros);
    const caseros = caserosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Obtener todos los usuarios (para valoracion_media)
    const refUsuarios = collection(db, "usuario");
    const usuariosSnapshot = await getDocs(refUsuarios);
    const usuarios = usuariosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Apply filters locally
    const filteredViviendas = viviendas.filter(vivienda => {
      // Filtros de precio, habitaciones, baños
      if (filtros.precioMin && vivienda.precio < parseInt(filtros.precioMin, 10)) return false;
      if (filtros.precioMax && vivienda.precio > parseInt(filtros.precioMax, 10)) return false;
      if (filtros.numHabitaciones && vivienda.numHabitaciones !== parseInt(filtros.numHabitaciones, 10)) return false;
      if (filtros.numBanyos && vivienda.numBanyos !== parseInt(filtros.numBanyos, 10)) return false;

      // Filtro de valoracion_media
      if (filtros.valoracion) {
        const valoracion = parseInt(filtros.valoracion, 10);
        const casero = caseros.find(c => String(c.Id_vivienda) === String(vivienda.id));
        if (!casero) return false;

        const usuario = usuarios.find(u => u.id === casero.DNI_Casero);
        if (!usuario || usuario.valoracion_media < valoracion - 1 || usuario.valoracion_media >= valoracion) {
          return false;
        }
      }

      return true;
    });

    console.log(`Se han encontrado ${filteredViviendas.length} viviendas.`);

    return filteredViviendas;
  } catch (error) {
    console.error("Error al leer viviendas con filtros:", error);
    return [];
  }
}

export async function readAllTrabajadores(categoria = null) {
  try {
    const trabajadoresSnapshot = await getDocs(collection(db, "trabajador"));
    const trabajadores = trabajadoresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Obtener todos los trabajos
    const trabajosSnapshot = await getDocs(collection(db, "trabajos"));
    const trabajos = trabajosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Obtener todos los usuarios
    const usuariosSnapshot = await getDocs(collection(db, "usuario"));
    const usuarios = usuariosSnapshot.docs.map(doc => ({ dni: doc.id, ...doc.data() }));

    if (!categoria) {
      // Añadir datos de trabajo y usuario a cada trabajador
      return trabajadores.map(trabajador => {
        const trabajo = trabajos.find(t => t.id === trabajador.id_trabajo);
        const usuario = usuarios.find(u => u.dni === trabajador.dni_trabajador);
        return {
          ...trabajador,
          tipo: trabajo ? trabajo.tipo : "Sin categoría",
          nombre: usuario ? `${usuario.nombre} ${usuario.apellidos}` : "Nombre desconocido"
        };
      });
    }
    
    // Filtrar trabajos por categoría
    const trabajosFiltrados = trabajos.filter(trabajo => trabajo.tipo === categoria);
    const trabajosIds = trabajosFiltrados.map(trabajo => trabajo.id);

    // Filtrar trabajadores por id_trabajo y añadir datos de trabajo y usuario
    const trabajadoresFiltrados = trabajadores
      .filter(trabajador => trabajosIds.includes(trabajador.id_trabajo))
      .map(trabajador => {
        const trabajo = trabajos.find(t => t.id === trabajador.id_trabajo);
        const usuario = usuarios.find(u => u.dni === trabajador.dni_trabajador);
        return {
          ...trabajador,
          tipo: trabajo ? trabajo.tipo : "Sin categoría",
          nombre: usuario ? `${usuario.nombre} ${usuario.apellidos}` : "Nombre desconocido"
        };
      });

    console.log(`Trabajadores filtrados para la categoría "${categoria}":`, trabajadoresFiltrados);
    return trabajadoresFiltrados;
  } catch (error) {
    console.error("Error al leer trabajadores:", error);
    return [];
  }
}

export async function getJobCategories() {
  try {
    const trabajosSnapshot = await getDocs(collection(db, "trabajos"));
    const categorias = new Set();
    trabajosSnapshot.forEach(doc => {
      categorias.add(doc.data().tipo);
    });
    console.log("Categorías de trabajos encontradas:", Array.from(categorias));
    return Array.from(categorias);
  } catch (error) {
    console.error("Error al obtener categorías de trabajos:", error);
    return [];
  }
}