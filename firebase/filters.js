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

export async function readAllTrabajadores(filtro = null) {
    if (!filtro) {
      console.log("Error: Falta el filtro.");
      return null;
    }
  
    // Buscar el trabajo con el filtro
    const trabajoSnapshot = await getDocs(query(collection(db, "trabajos"), where("tipo", "==", filtro)));
  
    if (trabajoSnapshot.empty) {
      console.log("Error: No se encontró un trabajo con ese tipo.");
      return null;
    }
  
    // Extraer el ID del primer documento encontrado
    const id = parseInt(trabajoSnapshot.docs[0].id);
  
    // Buscar trabajadores que tengan ese trabajo
    const trabajadoresSnapshot = await getDocs(query(collection(db, "trabajador"), where("id_trabajo", "==", id)));
  
    return trabajadoresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}