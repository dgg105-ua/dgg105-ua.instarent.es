// valoracion_inquilino.js
import { db } from "./firebaseConfig.js";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where
} from "firebase/firestore";
import { validarCaseroAsignado } from "./utils.js";

/**
 * Crea (o actualiza) la valoración que un CASERO (dni_valorador)
 * hace sobre un inquilino (dni_inquilino).
 * No se duplican valoraciones. Si existe, se actualiza.
 * Solo se permite si el valorador es casero en al menos una vivienda.
 */
export async function createValoracionInquilino(dni_inquilino, dni_valorador, valoracion, descripcion, fecha) {
  try {
    if (!dni_inquilino || !dni_valorador || valoracion == null) {
      console.log("Error: Faltan campos (dni_inquilino, dni_valorador, valoracion).");
      return;
    }

    // Verificar que el valorador sea un casero asignado
    const esCaseroValido = await validarCaseroAsignado(dni_valorador);
    if (!esCaseroValido) {
      console.log(`Error: El usuario ${dni_valorador} NO es casero de ninguna vivienda.`);
      return;
    }

    // Buscar si ya existe la valoración
    const refColl = collection(db, "valoracion_inquilino");
    const qExist = query(
      refColl,
      where("dni_inquilino", "==", dni_inquilino),
      where("dni_valorador", "==", dni_valorador)
    );
    const snapExist = await getDocs(qExist);

    if (!snapExist.empty) {
      // Ya existe → actualizamos
      const docToUpdate = snapExist.docs[0];
      const docRef = doc(db, "valoracion_inquilino", docToUpdate.id);
      await updateDoc(docRef, {
        valoracion,
        descripcion: descripcion || "",
        fecha: fecha || new Date().toISOString()
      });
      console.log(`Valoración de inquilino actualizada: ${dni_valorador} → ${dni_inquilino}.`);
      return;
    }

    // Crear nueva
    const newDocRef = await addDoc(refColl, {
      dni_inquilino,
      dni_valorador,
      valoracion,
      descripcion: descripcion || "",
      fecha: fecha || new Date().toISOString()
    });
    console.log("Valoración de inquilino creada con ID:", newDocRef.id);

  } catch (error) {
    console.error("Error al crear/actualizar valoración de inquilino:", error);
  }
}

export async function readValoracionInquilino(dniInquilino) {
  try {
    const ref = collection(db, "valoracion_inquilino");
    if (!dniInquilino) {
      // Trae todas
      const snap = await getDocs(ref);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } else {
      const q = query(ref, where("dni_inquilino", "==", dniInquilino));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  } catch (error) {
    console.error("Error al leer valoraciones de inquilino:", error);
    return [];
  }
}

export async function updateValoracionInquilino(docId, updatedData) {
  try {
    const ref = doc(db, "valoracion_inquilino", docId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      console.log("No existe esa valoración de inquilino.");
      return;
    }
    await updateDoc(ref, {
      ...updatedData,
      fecha: updatedData.fecha || new Date().toISOString()
    });
    console.log("Valoración de inquilino actualizada con éxito.");
  } catch (error) {
    console.error("Error al actualizar valoración de inquilino:", error);
  }
}

export async function deleteValoracionInquilino(docId) {
  try {
    const ref = doc(db, "valoracion_inquilino", docId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      console.log("No existe esa valoración de inquilino.");
      return;
    }
    await deleteDoc(ref);
    console.log("Valoración de inquilino eliminada con éxito.");
  } catch (error) {
    console.error("Error al eliminar valoración de inquilino:", error);
  }
}
