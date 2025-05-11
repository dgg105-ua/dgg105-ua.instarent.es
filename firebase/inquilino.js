// inquilino.js
import { db } from "./firebaseConfig.js";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  updateDoc,
  query,
  where
} from "firebase/firestore";
import { validarNoAutoAlquiler, inquilinoActualmenteOcupado } from "./utils.js";

/**
 * Crea un registro de inquilino que relaciona a un DNI con una vivienda,
 * fechas y un posible contrato.
 */
export async function createInquilino(DNI_Inquilino, ID_Vivienda, fecha_entrada, fecha_salida, contrato) {
  try {
    if (!DNI_Inquilino || !ID_Vivienda) {
      console.log("Error: Falta DNI del inquilino o ID de la vivienda.");
      return;
    }

    // Verificar que NO se autoalquile
    const sePermite = await validarNoAutoAlquiler(DNI_Inquilino, ID_Vivienda);
    if (!sePermite) {
      console.log("Error: No puedes alquilarte a ti mismo (autoalquiler).");
      return;
    }

    // Verificar que no esté actualmente en otro alquiler
    const ocupado = await inquilinoActualmenteOcupado(DNI_Inquilino);
    if (ocupado) {
      console.log(`Error: El inquilino ${DNI_Inquilino} ya está en un alquiler activo actualmente. No puede crear otro.`);
      return;
    }

    // Creación
    const ref = collection(db, "inquilino");
    const docRef = await addDoc(ref, {
      DNI_Inquilino,
      ID_Vivienda,
      fecha_entrada: fecha_entrada || null,
      fecha_salida: fecha_salida || null,
      contrato: contrato || null
    });

    console.log(`Inquilino creado con ID interno: ${docRef.id}`);
  } catch (error) {
    console.error("Error al crear inquilino:", error);
  }
}

/** Lee todos los inquilinos o filtra por DNI */
export async function readInquilino(dniInquilino) {
  try {
    const ref = collection(db, "inquilino");
    if (!dniInquilino) {
      // Devolver todos
      const snap = await getDocs(ref);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } else {
      const q = query(ref, where("DNI_Inquilino", "==", dniInquilino));
      const snap = await getDocs(q);
      if (snap.empty) {
        console.log("No se encontró inquilino con ese DNI.");
        return [];
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  } catch (error) {
    console.error("Error al leer inquilinos:", error);
    return [];
  }
}

export async function updateInquilino(idDoc, newData) {
  try {
    if (!idDoc || !newData) {
      console.log("Error: Falta el ID del documento y/o datos para actualizar.");
      return;
    }
    const ref = doc(db, "inquilino", idDoc);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      console.log("No existe un inquilino con ese ID de documento.");
      return;
    }

    await updateDoc(ref, newData);
    console.log("Inquilino actualizado con éxito.");
  } catch (error) {
    console.error("Error al actualizar inquilino:", error);
  }
}

export async function deleteInquilino(idDoc) {
  try {
    if (!idDoc) {
      console.log("Error: Falta el ID del documento para eliminar.");
      return;
    }
    const ref = doc(db, "inquilino", idDoc);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      console.log("No existe un inquilino con ese ID de documento.");
      return;
    }
    await deleteDoc(ref);
    console.log("Inquilino eliminado con éxito.");
  } catch (error) {
    console.error("Error al eliminar inquilino:", error);
  }
}

/**
 * Verifica si un usuario ha sido inquilino de una vivienda específica.
 * @param {string} dniInquilino - DNI del inquilino.
 * @param {string} idVivienda - ID de la vivienda.
 * @returns {boolean} - `true` si el usuario ha sido inquilino, `false` en caso contrario.
 */
export async function verificarInquilino(dniInquilino, idVivienda) {
  try {
    if (!dniInquilino || !idVivienda) {
      console.log("Error: Falta el DNI del inquilino o el ID de la vivienda.");
      return false;
    }

    // Convertir idVivienda a número entero
    idVivienda = parseInt(idVivienda, 10);

    if (isNaN(idVivienda)) {
      console.log("Error: El ID de la vivienda no es un número válido.");
      return false;
    }

    const ref = collection(db, "inquilino");
    const q = query(ref, where("DNI_Inquilino", "==", dniInquilino), where("ID_Vivienda", "==", idVivienda));
    const snap = await getDocs(q);

    if (!snap.empty) {
      console.log(`El usuario con DNI ${dniInquilino} ha sido inquilino de la vivienda ${idVivienda}.`);
      return true;
    } else {
      console.log(`El usuario con DNI ${dniInquilino} NO ha sido inquilino de la vivienda ${idVivienda}.`);
      return false;
    }
  } catch (error) {
    console.error("Error al verificar si el usuario ha sido inquilino:", error);
    return false;
  }
}
