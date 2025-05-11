// vivienda.js
import { db } from "./firebaseConfig.js";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit
} from "firebase/firestore";

import {
  existeDocumento,
  validarDireccion,
  obtenerCiudadProvincia
} from "./utils.js";

const COLECCION = "vivienda";

/**
 * Crea una vivienda.
 * - Puede usar un ID manual (id_vivienda) o generar uno incremental si no se pasa dicho ID.
 * - Valida la dirección (codpos, ciudad, provincia) usando la API de Zippopotam.us en utils.js.
 */
export async function createVivienda({
  nombre,
  descripcion,
  precio,
  metrosCuadrados,
  numHabitaciones,
  numBanyos,
  extras,
  id_vivienda, // si quieres forzar un ID manual
  tipo_calle,
  linea1,
  linea2,
  codpos,
  ciudad,
  provincia,
  imagen // Añadido el campo imagen
}) {
  try {
    if (!nombre || !descripcion) {
      console.log("Error: Faltan campos obligatorios (nombre, descripcion).");
      return;
    }

    if (numHabitaciones < 0 || numBanyos < 0) {
      console.log("Error: Los números de habitaciones y baños deben ser >= 0.");
      return;
    }

    // Valida coherencia de dirección con Zippopotam.us
    const direccionValida = await validarDireccion(codpos, ciudad, provincia, "ES");
    if (!direccionValida) {
      console.log("Error: La dirección no es válida o coherente.");
      return;
    }

    // Si no se especifica un ID de vivienda, generamos uno incremental
    if (!id_vivienda) {
      const all = collection(db, COLECCION);
      const q = query(all, orderBy("id_vivienda", "desc"), limit(1));
      const snap = await getDocs(q);

      let nextId = 1;
      if (!snap.empty) {
        const last = snap.docs[0].data();
        nextId = last.id_vivienda + 1;
      }
      id_vivienda = nextId;
    } else {
      // Verificar que no exista ya una vivienda con este ID
      const existe = await existeDocumento(COLECCION, id_vivienda.toString());
      if (existe) {
        console.log("Error: Ya existe una vivienda con ese id_vivienda.");
        return;
      }
    }

    // Creamos/guardamos la vivienda en Firestore
    const viviendaRef = doc(db, COLECCION, id_vivienda.toString());
    await setDoc(viviendaRef, {
      id_vivienda,
      nombre,
      descripcion,
      precio: precio || 0,
      metrosCuadrados: metrosCuadrados || 0,
      numHabitaciones: numHabitaciones || 0,
      numBanyos: numBanyos || 0,
      extras: extras || [],
      tipo_calle: tipo_calle || "",
      linea1: linea1 || "",
      linea2: linea2 || "",
      codpos: codpos || "",
      ciudad: ciudad || "",
      provincia: provincia || "",
      imagen: imagen || "img/default.jpg" // Guardar la imagen o usar una predeterminada
    });

    console.log(`Vivienda creada con id_vivienda: ${id_vivienda}`);
  } catch (error) {
    console.error("Error al crear la vivienda:", error);
  }
}

/**
 * Lee la vivienda por su ID y, además, llama a la API de Zippopotam.us
 * con su código postal para añadir la ciudad/provincia “oficiales” al resultado.
 */
export async function readVivienda(idVivienda) {
  try {
    const ref = doc(db, COLECCION, idVivienda.toString());
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      console.log("No existe una vivienda con ese ID.");
      return null;
    }

    const data = snap.data();

    // Obtenemos la ciudad/provincia oficial según la API (basado en el codpos guardado)
    const codpos = data.codpos || "";
    if (codpos) {
      const infoAPI = await obtenerCiudadProvincia(codpos, "ES");
      if (infoAPI) {
        // Añadimos ciudadAPI y provinciaAPI al objeto resultante
        data.ciudadAPI = infoAPI.city;
        data.provinciaAPI = infoAPI.state;
      } else {
        data.ciudadAPI = null;
        data.provinciaAPI = null;
      }
    } else {
      data.ciudadAPI = null;
      data.provinciaAPI = null;
    }

    return data;
  } catch (error) {
    console.error("Error al leer la vivienda:", error);
    return null;
  }
}

/**
 * Actualiza una vivienda
 */
export async function updateVivienda(idVivienda, newData) {
  try {
    if (!idVivienda || !newData) {
      console.log("Error: Falta ID o datos para actualizar.");
      return;
    }
    const docId = idVivienda.toString();

    // Verificar existencia
    if (!(await existeDocumento(COLECCION, docId))) {
      console.log("No existe la vivienda que intentas actualizar.");
      return;
    }

    const ref = doc(db, COLECCION, docId);
    await updateDoc(ref, newData);
    console.log("Vivienda actualizada con éxito.");
  } catch (error) {
    console.error("Error al actualizar la vivienda:", error);
  }
}

/**
 * Elimina una vivienda
 */
export async function deleteVivienda(idVivienda) {
  try {
    if (!idVivienda) {
      console.log("Error: Debes proporcionar un ID de vivienda.");
      return;
    }
    const docId = idVivienda.toString();

    // Verificar existencia
    if (!(await existeDocumento(COLECCION, docId))) {
      console.log("No existe la vivienda que intentas eliminar.");
      return;
    }
    const ref = doc(db, COLECCION, docId);
    await deleteDoc(ref);
    console.log("Vivienda eliminada con éxito.");
  } catch (error) {
    console.error("Error al eliminar la vivienda:", error);
  }
}
