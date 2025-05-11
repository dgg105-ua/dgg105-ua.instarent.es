// casero.js
import { db } from "./firebaseConfig.js";
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  deleteDoc,
  query,
  where,
  updateDoc
} from "firebase/firestore";
import { validarViviendaLibre } from "./utils.js";

/** Crea la relación casero -> vivienda con valoracion_media inicial */
export async function createCasero(DNI_Casero, Id_vivienda) {
  try {
    if (!DNI_Casero || !Id_vivienda) {
      console.log("Error: Falta DNI_Casero o Id_vivienda.");
      return;
    }

    // Verifica que la vivienda no tenga ya un casero
    const libre = await validarViviendaLibre(Id_vivienda);
    if (!libre) {
      console.log(`Error: La vivienda ${Id_vivienda} ya tiene un casero asignado.`);
      return;
    }

    const ref = collection(db, "casero");
    await addDoc(ref, {
      DNI_Casero,
      Id_vivienda
    });
    console.log(`Casero ${DNI_Casero} asignado correctamente a la vivienda ${Id_vivienda}.`);
  } catch (error) {
    console.error("Error al crear casero:", error);
  }
}

/** Lee todas las relaciones casero-vivienda o filtra por DNI_Casero */
export async function readCasero(dniCasero) {
  try {
    const ref = collection(db, "casero");
    if (!dniCasero) {
      const snap = await getDocs(ref);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } else {
      const q = query(ref, where("DNI_Casero", "==", dniCasero));
      const snap = await getDocs(q);
      if (snap.empty) {
        console.log("No se encontró casero con ese DNI.");
        return [];
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  } catch (error) {
    console.error("Error al leer casero:", error);
    return [];
  }
}

/** Actualiza la relación casero-vivienda por docId */
export async function updateCasero(docId, newData) {
  try {
    if (!docId || !newData) {
      console.log("Error: Falta el ID del documento o los nuevos datos para actualizar.");
      return;
    }
    const ref = doc(db, "casero", docId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      console.log("No existe un registro de casero con ese ID.");
      return;
    }
    await updateDoc(ref, newData);
    console.log("Casero actualizado con éxito.");
  } catch (error) {
    console.error("Error al actualizar casero:", error);
  }
}

/** Elimina la relación casero-vivienda por docId */
export async function deleteCasero(docId) {
  try {
    if (!docId) {
      console.log("Error: Falta el ID del documento a eliminar.");
      return;
    }
    const ref = doc(db, "casero", docId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      console.log("No existe un registro de casero con ese ID.");
      return;
    }
    await deleteDoc(ref);
    console.log("Casero eliminado con éxito.");
  } catch (error) {
    console.error("Error al eliminar casero:", error);
  }
}

/** Busca el DNI del casero asignado a una vivienda específica */
export async function buscarDniCaseroPorVivienda(Id_vivienda) {
  try {
    if (!Id_vivienda) {
      console.log("Error: Falta el ID de la vivienda.");
      return null;
    }
    

    const ref = collection(db, "casero");
    const q = query(ref, where("Id_vivienda", "==", Id_vivienda));
    const snap = await getDocs(q);

    if (snap.empty) {
      console.log(`No se encontró un casero asignado a la vivienda con ID ${Id_vivienda}.`);
      return null;
    }

    // Retornar únicamente el DNI del primer casero encontrado
    const casero = snap.docs[0].data();
    return casero.DNI_Casero;
  } catch (error) {
    console.error("Error al buscar el DNI del casero por vivienda:", error);
    return null;
  }
}