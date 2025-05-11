// contrata.js
import { db } from "./firebaseConfig.js";
import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from "firebase/firestore";

/**
 * Crea un registro de "contratación" entre un usuario y un trabajador,
 * con un id_contratacion incremental.
 */
export async function createContrata(dni_usuario, dni_trabajador) {
  try {
    if (!dni_usuario || !dni_trabajador) {
      console.log("Error: Falta dni_usuario o dni_trabajador.");
      return;
    }

    // Obtenemos el último ID y lo incrementamos
    const ref = collection(db, "contrata");
    const q = query(ref, orderBy("id_contratacion", "desc"), limit(1));
    const snap = await getDocs(q);

    let nuevoId = 1;
    if (!snap.empty) {
      const last = snap.docs[0].data();
      nuevoId = last.id_contratacion + 1;
    }

    // Guardamos
    const docRef = doc(db, "contrata", nuevoId.toString());
    await setDoc(docRef, {
      id_contratacion: nuevoId,
      dni_usuario,
      dni_trabajador
    });

    console.log(`Contratación creada con ID: ${nuevoId}`);
  } catch (error) {
    console.error("Error al crear contratacion:", error);
  }
}

export async function readContrata(id) {
  try {
    const docRef = doc(db, "contrata", id.toString());
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      console.log("No existe esa contratación.");
      return null;
    }
    return snap.data();
  } catch (error) {
    console.error("Error al leer contratacion:", error);
    return null;
  }
}

export async function updateContrata(id, updatedData) {
  try {
    const docRef = doc(db, "contrata", id.toString());
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      console.log("No existe la contratación con ID:", id);
      return;
    }
    await setDoc(docRef, updatedData, { merge: true });
    console.log("Contratación actualizada con éxito.");
  } catch (error) {
    console.error("Error al actualizar contratación:", error);
  }
}

export async function deleteContrata(id) {
  try {
    const docRef = doc(db, "contrata", id.toString());
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      console.log("No existe la contratación con ID:", id);
      return;
    }
    await deleteDoc(docRef);
    console.log("Contratación eliminada con éxito.");
  } catch (error) {
    console.error("Error al eliminar contratación:", error);
  }
}
